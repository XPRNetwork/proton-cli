import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { red } from 'colors'
import { config } from '../../storage/config'
import { encryptor } from '../../storage/encryptor'

export default class UnlockKey extends Command {
  static description = 'Unlock Keys with password'

  static args = [
    {name: 'password', required: false, mask: true },
  ]

  async run() {
    // Get args
    const {args} = this.parse(UnlockKey)

    // Check if already unlocked
    if (!config.get('isLocked')) {
      throw new Error('Wallet is already unlocked')
    }

    // Prompt if needed
    if (!args.password) {
      args.password = await CliUx.ux.prompt('Enter 32-char password')
    }

    // Decrypt and save existing keys
    const privateKeys = config.get('privateKeys').map(key => encryptor.decrypt(args.password, key))
    config.set('privateKeys', privateKeys)

    // Update config
    config.set('isLocked', false)

    // Print out success
    CliUx.ux.log(`Successfully unlocked wallet, please note that your private keys are insecure on disk until you call keys:lock again`)
  }

  async catch(e: Error) {
    CliUx.ux.error(red(e.message))
  }
}
