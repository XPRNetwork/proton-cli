import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { green, red } from 'colors'
import * as crypto from 'crypto'
import passwordManager from '../../storage/passwordManager'

export default class LockKey extends Command {
  static description = 'Lock Keys with password'

  async run() {
    // Prompt password from user
    let enteredPassword = await CliUx.ux.prompt('Enter 32 character password (leave empty to create new)', { type: 'hide', required: false })
    if (enteredPassword.length !== 0 && enteredPassword.length !== 32) {
        throw new Error('Password field must be empty or 32 characters long')
    }

    // Generate password if needed
    if (enteredPassword.length === 0) {
        enteredPassword = crypto.randomBytes(16).toString('hex')
        CliUx.ux.log(`
            Please safely store your 32 character password, you will need it to unlock your wallet:
            Password: ${green(enteredPassword)}
        `)
    }

    // Lock
    await passwordManager.lock(enteredPassword)

    // Log
    CliUx.ux.log(`${green('Success:')} Locked wallet`)
  }

  async catch(e: Error) {
    CliUx.ux.error(red(e.message))
  }
}
