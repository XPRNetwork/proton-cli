import {Command} from '@oclif/command'
import {ux} from 'cli-ux'
import {error} from '../../debug'
import {networks} from '../../constants'

export default class AllNetworks extends Command {
  static description = 'All Networks'

  async run() {
    ux.styledJSON(networks)
  }

  async catch(e: Error) {
    error(e)
    ux.styledJSON(e)
  }
}
