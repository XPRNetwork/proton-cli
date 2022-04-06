import { Command } from '@oclif/command'
import {CliUx} from '@oclif/core'
import {error} from '../../debug'
import { network } from '../../networks'

export default class GetNetwork extends Command {
  static description = 'Get Current Network'

  static aliases = ['network']

  async run() {
    CliUx.ux.log('Current Network:')
    CliUx.ux.styledJSON(network.network)
  }

  async catch(e: Error) {
    error(e)
    CliUx.ux.styledJSON(e)
  }
}
