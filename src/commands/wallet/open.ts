import {Command} from '@oclif/command'
import {Keosd} from '@protonprotocol/protonjs'
import {ux} from 'cli-ux'
import {error} from '../../debug'

export default class OpenWallet extends Command {
  static description = 'Open local wallet'

  static args = [
    {name: 'name', default: 'default'},
  ]

  async run() {
    const {args} = this.parse(OpenWallet)
    await Keosd.wallet_open(args.name)
    this.log(`Wallet ${args.name} successfully opened`)
  }

  async catch(e: Error) {
    error(e)
    ux.styledJSON(e)
  }
}
