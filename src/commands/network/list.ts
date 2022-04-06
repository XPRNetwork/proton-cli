import { Command } from '@oclif/command'
import {error} from '../../debug'
import {networks} from '../../constants'
import { CliUx } from '@oclif/core'

export default class AllNetworks extends Command {
  static description = 'All Networks'

  async run() {
    CliUx.ux.log('All Networks:')
    CliUx.ux.styledJSON(networks)
  }

  async catch(e: Error) {
    error(e)
    CliUx.ux.styledJSON(e)
  }
}
