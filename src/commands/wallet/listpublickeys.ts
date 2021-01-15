import {Command} from '@oclif/command'
import {Keosd} from '@protonprotocol/protonjs'
import {ux} from 'cli-ux'
import {error} from '../../debug'

export default class ListPublicKeys extends Command {
  static description = 'List public keys for all wallets'

  async run() {
    const publicKeys = await Keosd.wallet_list_public_keys()
    ux.styledJSON(publicKeys)
  }

  async catch(e: Error) {
    error(e)
    ux.styledJSON(e)
  }
}
