import {Command} from '@oclif/command'
import {Keosd} from '@protonprotocol/protonjs'
import {ux} from 'cli-ux'

export default class ListWallets extends Command {
  static description = 'List open wallets'

  static aliases = ['wallet']

  async run() {
    const wallets = await Keosd.wallet_list_wallets()
    this.log('Open Wallets:')
    ux.styledJSON(wallets)
  }

  async catch(error: Error) {
    ux.styledJSON(error)
  }
}
