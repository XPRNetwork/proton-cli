import {Command} from '@oclif/command'
import {Keosd} from '@protonprotocol/protonjs'
import {ux} from 'cli-ux'

export default class StopKeos extends Command {
  static description = 'Stops Keosd'

  async run() {
    await Keosd.keosd_stop()
  }

  async catch(error: Error) {
    ux.styledJSON(error)
  }
}
