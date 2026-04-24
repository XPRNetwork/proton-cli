import { Command, flags } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { Key } from '@proton/js'
import { red, yellow } from 'colors'
import passwordManager from '../../storage/passwordManager'
import { network } from '../../storage/networks'
import { isRevealPasswordSet, requireRevealPassword } from '../../storage/revealPassword'

const CONFIRMATION_PHRASE = 'I UNDERSTAND'

export default class ListAllKeys extends Command {
  static description = 'List saved keys. Shows public keys and associated accounts by default; pass --reveal-private to include private keys (gated by the reveal password if one is set).'

  static flags = {
    'reveal-private': flags.boolean({
      char: 'r',
      description: 'Include private keys in the output (requires the reveal password if set, or a typed confirmation otherwise)',
      default: false,
    }),
  }

  async run() {
    const { flags: parsedFlags } = this.parse(ListAllKeys)
    const revealPrivate = parsedFlags['reveal-private']

    const privateKeys = await passwordManager.getPrivateKeys()
    if (privateKeys.length === 0) {
      CliUx.ux.log('No keys saved.')
      return
    }

    const publicKeys = privateKeys.map(pk => Key.PrivateKey.fromString(pk).getPublicKey().toString())

    let accountsByPubkey: Record<string, Array<{ account: string; permission: string }>> = {}
    try {
      const res = await network.rpc.get_accounts_by_authorizers([], publicKeys)
      for (const entry of res.accounts) {
        if (!entry.authorizing_key) continue
        // RPC may return keys in legacy EOS format; normalize to modern PUB_K1_... form.
        const canonical = Key.PublicKey.fromString(entry.authorizing_key).toString()
        const list = accountsByPubkey[canonical] || (accountsByPubkey[canonical] = [])
        list.push({ account: entry.account_name, permission: entry.permission_name })
      }
    } catch (err) {
      CliUx.ux.warn(`Could not resolve accounts for keys: ${(err as Error).message}`)
    }

    if (!revealPrivate) {
      const display = privateKeys.map(pk => {
        const publicKey = Key.PrivateKey.fromString(pk).getPublicKey().toString()
        return {
          publicKey,
          accounts: accountsByPubkey[publicKey] || [],
        }
      })
      CliUx.ux.styledJSON(display)
      CliUx.ux.log(yellow('\nPrivate keys hidden. Use --reveal-private to include them.'))
      return
    }

    if (!process.stdout.isTTY || !process.stdin.isTTY) {
      CliUx.ux.error('Refusing to print private keys to a non-TTY stream. Run this in an interactive terminal.')
    }

    if (isRevealPasswordSet()) {
      await requireRevealPassword()
    } else {
      CliUx.ux.log(yellow('No reveal password is set. Run `proton key:reveal-setup` to protect private-key reveals behind a password that AI agents running on this machine cannot bypass.'))
      CliUx.ux.log(red('WARNING: This will print your PRIVATE KEYS to the terminal.'))
      CliUx.ux.log(red('Anyone with these keys can control your accounts. Make sure no one is watching and your terminal is not being recorded.'))
      const confirmation = await CliUx.ux.prompt(`Type "${CONFIRMATION_PHRASE}" to continue`)
      if (confirmation !== CONFIRMATION_PHRASE) {
        CliUx.ux.error('Confirmation phrase did not match. Aborting.')
      }
    }

    const display = privateKeys.map(pk => {
      const parsed = Key.PrivateKey.fromString(pk)
      const publicKey = parsed.getPublicKey().toString()
      return {
        publicKey,
        privateKey: parsed.toString(),
        accounts: accountsByPubkey[publicKey] || [],
      }
    })
    CliUx.ux.styledJSON(display)
  }
}
