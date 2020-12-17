import {Command} from '@oclif/command'
import {Keosd} from '@protonprotocol/protonjs'
import {ux} from 'cli-ux'

export default class LockAllWallets extends Command {
  static description = 'Lock all local wallets'

  async run() {
    await Keosd.wallet_lock_all()
  }

  async catch(error: Error) {
    ux.styledJSON(error)
  }
}
