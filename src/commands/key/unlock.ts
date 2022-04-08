import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { green, red, yellow } from 'colors'
import passwordManager from '../../storage/passwordManager'

export default class UnlockKey extends Command {
  static description = 'Unlock all keys (Caution: Your keys will be stored in plaintext on disk)'

  static args = [
    {name: 'password', required: false, hide: true },
  ]

  async run() {
    // Get args
    const {args} = this.parse(UnlockKey)

    // Prompt if needed
    if (!args.password) {
      args.password = await CliUx.ux.prompt('Enter 32 character password', { type: 'hide' })
    }

    // UnLock
    await passwordManager.unlock(args.password)

    // Print out success
    CliUx.ux.log(`${green('Success:')} Unlocked wallet`)
    CliUx.ux.log(`${yellow('Note:')} Your private keys are stored as plaintext on disk until you call keys:lock again`)
  }

  async catch(e: Error) {
    CliUx.ux.error(red(e.message))
  }
}
