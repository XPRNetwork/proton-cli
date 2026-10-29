import { ux } from '../../utils/ux'

import { Flags, Command, Args } from '@oclif/core'
import { network } from '../../storage/networks'
import * as inquirer from 'inquirer'
import { networks } from '../../constants'

export default class SetChain extends Command {
  static description = 'Set Chain'

  static args = {
    chain: Args.string({
      required: false,
      description: 'Specific chain',
    }),
  }

  async run() {
    const {args} = await this.parse(SetChain)

    if (!args.chain) {
      let responses: any = await inquirer.prompt([{
        name: 'chain',
        message: 'Select a chain',
        type: 'list',
        choices: networks.map(_ => _.chain),
      }])
      args.chain = responses.chain
    }

    // Check chain is right
    const existingNetwork = networks.find(_ => _.chain === args.chain)
    if (!existingNetwork) {
      throw new Error(`No chain found with ${args.chain}`)
    }

    network.setChain(args.chain!)
  }

  async catch(e: Error) {
    ux.error(e)
  }
}
