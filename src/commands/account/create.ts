import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { network } from '../../storage/networks'
import GenerateKey from '../key/generate'
import { Key } from '@proton/js'
import { createAccount } from '../../apis/createAccount'
import AddPrivateKey from '../key/add'
import { green } from 'colors'

export default class CreateNewAccount extends Command {
  static description = 'Create New Account'

  static args = [
    { name: 'account', required: true },
  ]

  async run() {
    const { args } = this.parse(CreateNewAccount)

    // Check account doesnt exist
    try {
      await network.rpc.get_account(args.account)
      CliUx.ux.log(`Account ${args.account} already exists`)
      return
    } catch (e) {}

    // Create key
    let privateKey = await CliUx.ux.prompt('Enter private key for new account (leave empty to generate new key)', { type: 'hide', required: false })
    if (!privateKey) {
      privateKey = await GenerateKey.run()
      await AddPrivateKey.run([privateKey])
    }
    privateKey = Key.PrivateKey.fromString(privateKey).toString()
    const publicKey = Key.PrivateKey.fromString(privateKey).getPublicKey().toLegacyString()

    // Get some data
    const email = await CliUx.ux.prompt('Enter email for verification code', { required: true })
    const displayName = await CliUx.ux.prompt('Enter display name for account', { required: true })

    // Send request
    const data = {
      email: email,
      name: displayName,
      chainAccount: args.account,
      ownerPublicKey: publicKey,
      activePublicKey: publicKey,
      verificationCode: undefined
    }
    let res = await createAccount(data)

    // Exit early if error
    if (res.error && res.error === 'mfa_required') {
      data.verificationCode = await CliUx.ux.prompt(`Enter 6-digit verification code (sent to ${email})`, { required: true })
    } else {
      throw new Error(`Could not create account with error: ${res.error}`)
    }

    // Send verification
    res = await createAccount(data)
    if (res.user) {
      CliUx.ux.log(green(`Account ${args.account} successfully created!`))
    } else {
      throw new Error(`Could not create account with error: ${res.error}`)
    }
  }
}
