import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { green, red } from 'colors'
import { config } from '../../storage/config'
import { encryptor } from '../../storage/encryptor'
import * as crypto from 'crypto'

export default class LockKey extends Command {
  static description = 'Lock Keys with password'

  async run() {
    // Check if already locked
    if (config.get('isLocked')) {
      throw new Error('Wallet is already locked')
    }

    // Prompt password from user
    let enteredPassword = await CliUx.ux.prompt('Enter 32-char password (leave empty to create new)', { type: 'mask', required: false })
    if (enteredPassword.length !== 0 && enteredPassword.length !== 32) {
        throw new Error('Password field must be empty or 32 characters long')
    }

    // Generate password if needed
    if (enteredPassword.length === 0) {
        enteredPassword = crypto.randomBytes(16).toString('hex')
        CliUx.ux.log(`
            Please safely store your 32-char password, you will need it to unlock your wallet:
            Password: ${green(enteredPassword)}
        `)
    }

    // Encrypt and save existing keys
    const privateKeys = config.get('privateKeys').map(key => encryptor.encrypt(enteredPassword, key))
    config.set('privateKeys', privateKeys)

    // Update config
    config.set('isLocked', true)

    // Log
    CliUx.ux.log('Successfully locked wallet!')
  }

  async catch(e: Error) {
    CliUx.ux.error(red(e.message))
  }
}
