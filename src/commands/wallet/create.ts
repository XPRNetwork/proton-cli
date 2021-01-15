import {Command} from '@oclif/command'
import {Keosd} from '@protonprotocol/protonjs'
import {ux} from 'cli-ux'
import {error} from '../../debug'

export default class CreateWallet extends Command {
  static description = 'Create new local wallet'

  static args = [
    {name: 'name', default: 'default'},
  ]

  async run() {
    const {args} = this.parse(CreateWallet)
    const walletPassword = await Keosd.wallet_create(args.name)
    this.log(`Wallet Name: ${args.name}`)
    this.log(`Wallet Password: ${walletPassword}`)
  }

  async catch(e: Error) {
    error(e)
    ux.styledJSON(e)
  }
}
