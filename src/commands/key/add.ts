import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { red } from 'colors'
import { config } from '../../storage/config'
import passwordManager from '../../storage/passwordManager'
import LockKey from './lock'

export default class AddPrivateKey extends Command {
  static description = 'Manage Keys'

  static args = [
    {name: 'privateKey', required: false},
  ]

  async run() {
    const {args} = this.parse(AddPrivateKey)

    // Prompt whether to lock
    if (!config.get('isLocked')) {
      const toEncrypt = await CliUx.ux.confirm('Would you like to encrypt your stored keys with a password? (yes/no)')
      if (toEncrypt) {
        await LockKey.run()
      }
    }

    // Prompt if needed
    if (!args.privateKey) {
      args.privateKey = await CliUx.ux.prompt('Enter private key (starts with PVT_K1)', { type: 'hide' })
    }

    await passwordManager.addPrivateKey(args.privateKey)
  }

  async catch(e: Error) {
    CliUx.ux.error(red(e.message))
  }
}
