import {Command} from '@oclif/command'
import {Keosd} from '@protonprotocol/protonjs'
import {ux} from 'cli-ux'

export default class ListWallets extends Command {
  static description = 'List open wallets'

  async run() {
    const wallets = await Keosd.wallet_list_wallets()
    ux.styledJSON(wallets)
  }

  async catch(error: Error) {
    ux.styledJSON(error)
  }
}
