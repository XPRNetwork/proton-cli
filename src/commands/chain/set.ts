import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import {error} from '../../debug'
import { network } from '../../storage/networks'

// import {Command, Flags} from '@oclif/core'
// import * as inquirer from 'inquirer'
// import { networks } from '../../constants'

// export class MyCommand extends Command {
//   static flags = {
//     stage: Flags.string({options: ['development', 'staging', 'production']})
//   }

//   async run() {
//     const {flags} = this.parse(MyCommand)
//     let stage = flags.stage
//     if (!stage) {
//       let responses: any = await inquirer.prompt([{
//         name: 'stage',
//         message: 'select a stage',
//         type: 'list',
//         choices: [{name: 'development'}, {name: 'staging'}, {name: 'production'}],
//       }])
//       stage = responses.stage
//     }
//     this.log(`the stage is: ${stage}`)
//   }
// }

export default class SetChain extends Command {
  static description = 'Set Chain'

  // static flags = {
  //   chain: Flags.string({options: networks.map(_ => _.chain), default: 'proton'})
  // }

  async run() {
    const {flags} = this.parse(SetChain)
    // network.setChain(args.chain)
  }

  async catch(e: Error) {
    error(e)
    CliUx.ux.error(e)
  }
}
