import { Command } from '@oclif/command'
import { CliUx, Flags } from '@oclif/core'
import {error} from '../../debug'
import { network } from '../../storage/networks'
import * as inquirer from 'inquirer'
import { networks } from '../../constants'

export default class SetChain extends Command {
  static description = 'Set Chain'

  static args = []
  
  static flags = {
    chain: Flags.string({
      options: networks.map(_ => _.chain)
    })
  }

  async run() {
    const {flags} = this.parse(SetChain as any) as any
    let chain = flags.stage
    if (!chain) {
      let responses: any = await inquirer.prompt([{
        name: 'chain',
        message: 'Select a chain',
        type: 'list',
        choices: networks.map(_ => ({ name: _.chain })),
      }])
      chain = responses.chain
    }
    network.setChain(chain)
  }

  async catch(e: Error) {
    error(e)
    CliUx.ux.error(e)
  }
}
