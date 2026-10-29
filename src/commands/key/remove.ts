import { Command, Args } from '@oclif/core'
import { ux } from '../../utils/ux'

import { Key } from '@proton/js'
import { green, red } from 'colors'
import passwordManager from '../../storage/passwordManager'

export default class RemoveKey extends Command {
  static description = 'Remove Key'

  static args = {
    privateKey: Args.string({
      required: false,
    }),
  }

  async run() {
    const {args} = await this.parse(RemoveKey)

    // Prompt if needed
    if (!args.privateKey) {
      args.privateKey = await ux.prompt('Enter private key to delete (starts with PVT_K1)', { type: 'hide' })
    }

    // Confirm
    const confirmed = await ux.confirm('Are you sure you want to delete this private key? (yes/no)')
    if (!confirmed) {
      return
    }

    // Remove
    await passwordManager.removePrivateKey(args.privateKey)

    // Log
    ux.log(`${green('Success:')} Removed private key for public key ${Key.PrivateKey.fromString(args.privateKey).getPublicKey()}`)
  }

  async catch(e: Error) {
    ux.error(red(e.message))
  }
}
