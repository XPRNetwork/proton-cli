import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { red } from 'colors'
import {error} from '../../debug'
import passwordManager from '../../storage/passwordManager'

export default class AddKey extends Command {
  static description = 'Add Key'

  static args = [
    {name: 'privateKey', required: false},
  ]

  async run() {
    const {args} = this.parse(AddKey)

    // Prompt if needed
    if (!args.privateKey) {
      args.privateKey = await CliUx.ux.prompt('Enter private key (starts with PVT_K1)', { type: 'mask' })
    }

    await passwordManager.addPrivateKey(args.privateKey)
  }

  async catch(e: Error) {
    error(e)
    CliUx.ux.error(red(e.message))
  }
}
