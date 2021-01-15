import {Command} from '@oclif/command'
import {ux} from 'cli-ux'
import {error} from '../debug'

const packageJson = require('../../package.json')

export default class Version extends Command {
  static description = 'Version of CLI'

  async run() {
    this.log(packageJson.version)
  }

  async catch(e: Error) {
    error(e)
    ux.styledJSON(e)
  }
}
