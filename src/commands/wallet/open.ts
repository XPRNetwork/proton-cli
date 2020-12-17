import {Command} from '@oclif/command'
import {Keosd} from '@protonprotocol/protonjs'
import {ux} from 'cli-ux'

export default class OpenWallet extends Command {
  static description = 'Open local wallet'

  static args = [
    {name: 'name', default: 'default'},
  ]

  async run() {
    const {args} = this.parse(OpenWallet)
    await Keosd.wallet_open(args.name)
  }

  async catch(error: Error) {
    ux.styledJSON(error)
  }
}
