import {Command} from '@oclif/command'
import {Keosd} from '@protonprotocol/protonjs'
import {ux} from 'cli-ux'

export default class CreateKeyWallet extends Command {
  static description = 'Create key in wallet'

  static args = [
    {name: 'name', default: 'default'},
    {name: 'type', default: ''},
  ]

  async run() {
    const {args} = this.parse(CreateKeyWallet)
    const publicKey = await Keosd.wallet_create_key(args.name, args.type)
    this.log(`Created key in wallet ${args.name} with public key: ${publicKey}`)
  }

  async catch(error: Error) {
    ux.styledJSON(error)
  }
}
