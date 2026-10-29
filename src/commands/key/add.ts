import { Command, Args } from '@oclif/core'
import { ux } from '../../utils/ux'

import { red } from 'colors'
import { config } from '../../storage/config'
import passwordManager from '../../storage/passwordManager'
import LockKey from './lock'

export default class AddPrivateKey extends Command {
  static description = 'Manage Keys'

  static args = {
    privateKey: Args.string({
      required: false,
    }),
  }

  async run() {
    const {args} = await this.parse(AddPrivateKey)

    // Prompt whether to lock
    if (!config.get('isLocked')) {
      const toEncrypt = await ux.confirm('Would you like to encrypt your stored keys with a password? (yes/no)')
      if (toEncrypt) {
        await LockKey.run()
      }
    }

    // Prompt if needed
    if (!args.privateKey) {
      args.privateKey = await ux.prompt('Enter private key (starts with PVT_K1)', { type: 'hide' })
    }

    await passwordManager.addPrivateKey(args.privateKey)
  }

  async catch(e: Error) {
    ux.error(red(e.message))
  }
}
