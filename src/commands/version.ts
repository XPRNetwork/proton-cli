import { Command } from '@oclif/core'
import { ux } from '../utils/ux'

const packageJson = require('../../package.json')

export default class Version extends Command {
  static description = 'Version of CLI'

  async run() {
    this.log(packageJson.version)
  }

  async catch(e: Error) {
    ux.styledJSON(e)
  }
}
