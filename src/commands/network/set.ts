import {Command} from '@oclif/command'
import {ux} from 'cli-ux'
import {error} from '../../debug'
import {currentNetwork} from '../../networks'

export default class SetNetwork extends Command {
  static description = 'Set Current Network'

  static args = [
    {name: 'chain', required: true},
  ]

  async run() {
    const {args} = this.parse(SetNetwork)
    currentNetwork.set(args.chain)
    this.log('Network successfully set')
  }

  async catch(e: Error) {
    error(e)
    ux.styledJSON(e)
  }
}
