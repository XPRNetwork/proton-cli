import {Command} from '@oclif/command'
import {Keosd, Key} from '@protonprotocol/protonjs'
import cli, {ux} from 'cli-ux'
import {error} from '../../debug'

export default class ListPrivateKeys extends Command {
  static description = 'List private keys for a single wallet'

  static args = [
    {name: 'name', default: 'default'},
  ]

  async run() {
    const {args} = this.parse(ListPrivateKeys)
    const password = await cli.prompt(`Enter wallet password for wallet '${args.name}'`, {type: 'hide'})

    // Unlock
    try {
      await Keosd.wallet_unlock(args.name, password)
    } catch (_) {}

    // Get Private k eys
    const private_keys = await Keosd.wallet_list_private_keys(args.name, password)

    ux.styledJSON(
      private_keys.map(
        ([public_key, private_key]: [string, string]) =>
          [
            public_key,
            Key.PublicKey.fromString(public_key).toString(),
            private_key,
            Key.PrivateKey.fromString(private_key).toString(),
          ]
      )
    )
  }

  async catch(e: Error) {
    error(e)
    ux.styledJSON(e)
  }
}
