import {Command} from '@oclif/command'
import {Keosd} from '@protonprotocol/protonjs'
import {ux} from 'cli-ux'
import {error} from '../../debug'

export default class LockWallet extends Command {
  static description = 'Lock local wallet'

  static args = [
    {name: 'name', default: 'default'},
  ]

  async run() {
    const {args} = this.parse(LockWallet)
    await Keosd.wallet_lock(args.name)
    this.log(`Wallet ${args.name}} is now locked`)
  }

  async catch(e: Error) {
    error(e)
    ux.styledJSON(e)
  }
}
