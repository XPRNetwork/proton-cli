import {Command} from '@oclif/command'
import {ux} from 'cli-ux'
import {error} from '../../debug'
import {currentNetwork} from '../../networks'

export default class GetNetwork extends Command {
  static description = 'Get Current Network'

  static aliases = ['network']

  async run() {
    const network = await currentNetwork.get()
    ux.styledJSON(network)
  }

  async catch(e: Error) {
    error(e)
    ux.styledJSON(e)
  }
}
