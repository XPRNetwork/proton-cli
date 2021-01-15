import {Command} from '@oclif/command'
import {Keosd} from '@protonprotocol/protonjs'
import cli, {ux} from 'cli-ux'
import {error} from '../../debug'

export default class RemoveKeyWallet extends Command {
  static description = 'Remove private key from wallet'

  static args = [
    {name: 'name', default: 'default'},
    {name: 'public_key'},
  ]

  async run() {
    const {args} = this.parse(RemoveKeyWallet)
    if (!args.public_key) {
      this.log('Must provide public key to remove')
      return
    }
    const password = await cli.prompt(`Enter wallet password for wallet '${args.name}'`, {type: 'hide'})
    await Keosd.wallet_remove_key(args.name, password, args.public_key)
    this.log(`Key ${args.public_key} successfully removed from wallet '${args.name}'`)
  }

  async catch(e: Error) {
    error(e)
    ux.styledJSON(e)
  }
}
