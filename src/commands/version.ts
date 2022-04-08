import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'

const packageJson = require('../../package.json')

export default class Version extends Command {
  static description = 'Version of CLI'

  async run() {
    this.log(packageJson.version)
  }

  async catch(e: Error) {
    CliUx.ux.styledJSON(e)
  }
}
