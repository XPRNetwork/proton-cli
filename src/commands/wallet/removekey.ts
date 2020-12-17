import {Command} from '@oclif/command'
import {Keosd} from '@protonprotocol/protonjs'
import cli, {ux} from 'cli-ux'

export default class RemoveKeyWallet extends Command {
  static description = 'Remove private key from wallet'

  static args = [
    {name: 'name', default: 'default'},
    {name: 'public_key', required: true},
  ]

  async run() {
    const {args} = this.parse(RemoveKeyWallet)
    const password = await cli.prompt(`Enter wallet password for wallet '${args.name}'`, {type: 'hide'})
    await Keosd.wallet_remove_key(args.name, password, args.public_key)
  }

  async catch(error: Error) {
    ux.styledJSON(error)
  }
}
