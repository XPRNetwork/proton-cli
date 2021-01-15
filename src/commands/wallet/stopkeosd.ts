import {Command} from '@oclif/command'
import {Keosd} from '@protonprotocol/protonjs'
import {ux} from 'cli-ux'
import {error} from '../../debug'

export default class StopKeos extends Command {
  static description = 'Stops Keosd'

  async run() {
    await Keosd.keosd_stop()
    this.log('Keosd successfully stopped')
  }

  async catch(e: Error) {
    error(e)
    ux.styledJSON(e)
  }
}
