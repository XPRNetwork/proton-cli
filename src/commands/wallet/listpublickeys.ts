import {Command} from '@oclif/command'
import {Keosd} from '@protonprotocol/protonjs'
import {ux} from 'cli-ux'

export default class ListPublicKeys extends Command {
  static description = 'List public keys'

  async run() {
    const publicKeys = await Keosd.wallet_list_public_keys()
    ux.styledJSON(publicKeys)
  }

  async catch(error: Error) {
    ux.styledJSON(error)
  }
}
