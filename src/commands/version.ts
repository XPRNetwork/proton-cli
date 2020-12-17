import {Command} from '@oclif/command'

const packageJson = require('../../package.json')

export default class Version extends Command {
  static description = 'Version of CLI'

  async run() {
    this.log(packageJson.version)
  }
}
