import {Command} from '@oclif/command'
import {Keosd} from '@protonprotocol/protonjs'
import {ux} from 'cli-ux'
import {error} from '../../debug'

export default class LockAllWallets extends Command {
  static description = 'Lock all local wallets'

  async run() {
    await Keosd.wallet_lock_all()
    this.log('All wallets are locked')
  }

  async catch(e: Error) {
    error(e)
    ux.styledJSON(e)
  }
}
