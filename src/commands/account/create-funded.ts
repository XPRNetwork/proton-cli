import { Command, flags } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { network } from '../../storage/networks'
import { Mnemonic } from '@proton/mnemonic'
import passwordManager from '../../storage/passwordManager'
import { green, red, yellow } from 'colors'
import { getExplorer } from '../../apis/getExplorer'
import { parseDetailsError } from '../../utils/detailsError'

export default class CreateFundedAccount extends Command {
  static description = `Create a new account funded by an existing account (no email verification).

The creator account pays for RAM and signs the transaction.
CPU and NET bandwidth are delegated for free by the network.

Account naming rules:
  - Must be 4-12 characters long
  - Only lowercase letters a-z and digits 1-5 are allowed
  - Periods (.) are allowed but the suffix must be owned by the creator
  - Characters 0, 6, 7, 8, 9 are NOT allowed
  - Examples: myaccount, agent11111, test.paul

Security:
  Use --owner to add a backup account to the owner permission.
  This allows the designated owner to recover or rotate keys
  on the new account if the generated key is lost or compromised.
  The owner permission threshold is set to 1, so either the key
  or the owner account can act independently.

Cost: ~6-7 XPR per 3000 bytes of RAM (default).
The creator account must hold enough XPR to cover RAM costs.`

  static examples = [
    '$ proton account:create-funded myaccount --creator fundingacct',
    '$ proton account:create-funded myaccount -c fundingacct --ram 8192',
    '$ proton account:create-funded myaccount -c fundingacct -k PUB_K1_...',
    '$ proton account:create-funded agentacct -c fundingacct --owner paul123',
  ]

  static args = [
    { name: 'account', required: true, description: 'New account name (4-12 chars, a-z and 1-5 only)' },
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    creator: flags.string({ char: 'c', required: true, description: 'Existing account that pays for and creates the new account' }),
    key: flags.string({ char: 'k', description: 'Public key for new account (PUB_K1_... format). Generates new key if omitted' }),
    ram: flags.integer({ char: 'r', default: 3000, description: 'RAM bytes to purchase for new account (minimum 3000)' }),
    owner: flags.string({ char: 'o', description: 'Account to add as backup owner (can recover/rotate keys if agent key is lost)' }),
  }

  async run() {
    const { args, flags } = this.parse(CreateFundedAccount)
    const accountName: string = args.account.toLowerCase()

    // Validate account name with helpful error messages
    if (accountName.length < 4 || accountName.length > 12) {
      throw new Error(
        `Account name "${accountName}" is ${accountName.length} characters. Must be 4-12 characters long.`
      )
    }
    if (/[06789]/.test(accountName)) {
      const badChars = accountName.match(/[06789]/g)!.join(', ')
      throw new Error(
        `Account name "${accountName}" contains invalid digit(s): ${badChars}. Only digits 1-5 are allowed.`
      )
    }
    if (/[A-Z]/.test(args.account)) {
      this.log(`${yellow('Note:')} Account name converted to lowercase: ${accountName}`)
    }
    if (!/^[a-z12345.]+$/.test(accountName)) {
      const badChars = accountName.match(/[^a-z12345.]/g)!.join(', ')
      throw new Error(
        `Account name "${accountName}" contains invalid character(s): ${badChars}. Only a-z, 1-5, and periods are allowed.`
      )
    }

    // Validate RAM
    if (flags.ram < 3000) {
      throw new Error('RAM must be at least 3000 bytes for a new account to function.')
    }

    // Check account doesn't already exist
    try {
      await network.rpc.get_account(accountName)
      this.log(`Account ${accountName} already exists`)
      return
    } catch (e) {}

    // Determine public key
    let publicKey = flags.key
    if (!publicKey) {
      const mnemonic = new Mnemonic({ numWords: 12 })
      const keyPair = mnemonic.keyPairAtIndex(0)
      publicKey = keyPair.publicKey.toString()
      const privateKey = keyPair.privateKey.toString()

      this.log('Generated new key pair:')
      CliUx.ux.styledJSON({
        public: publicKey,
        private: privateKey,
        mnemonic: mnemonic.phrase,
      })

      // Store the private key
      await passwordManager.addPrivateKey(privateKey)
    }

    // Build owner permission: key + optional backup owner account
    const ownerPerm: any = {
      threshold: 1,
      keys: [{ key: publicKey, weight: 1 }],
      accounts: [],
      waits: [],
    }
    if (flags.owner) {
      ownerPerm.accounts.push({
        weight: 1,
        permission: { actor: flags.owner, permission: 'active' },
      })
    }

    // Build 3-action transaction:
    // 1. Create account on-chain (creator pays)
    // 2. Buy RAM for the new account (creator pays)
    // 3. Delegate CPU/NET via eosio.proton (free, paid by wlcm.proton)
    const actions = [
      {
        account: 'eosio',
        name: 'newaccount',
        authorization: [{ actor: flags.creator, permission: 'active' }],
        data: {
          creator: flags.creator,
          name: accountName,
          owner: ownerPerm,
          active: {
            threshold: 1,
            keys: [{ key: publicKey, weight: 1 }],
            accounts: [],
            waits: [],
          },
        },
      },
      {
        account: 'eosio',
        name: 'buyrambytes',
        authorization: [{ actor: flags.creator, permission: 'active' }],
        data: {
          payer: flags.creator,
          receiver: accountName,
          bytes: flags.ram,
        },
      },
      {
        account: 'eosio.proton',
        name: 'newaccres',
        authorization: [{ actor: flags.creator, permission: 'active' }],
        data: {
          account: accountName,
        },
      },
    ]

    await network.transact({ actions })

    this.log(green(`Account ${accountName} successfully created!`))
    this.log(`Creator: ${flags.creator}`)
    if (flags.owner) {
      this.log(`Owner: ${flags.owner} (backup recovery account)`)
    }
    this.log(`RAM: ${flags.ram} bytes`)
    this.log(`CPU/NET: delegated by wlcm.proton (free)`)
    await CliUx.ux.url('View on explorer', `${getExplorer()}/account/${accountName}`)
  }

  async catch(e: Error | any) {
    parseDetailsError(e)
  }
}
