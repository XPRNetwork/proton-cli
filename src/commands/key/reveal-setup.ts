import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { green, red, yellow } from 'colors'
import {
  hashRevealPassword,
  isRevealPasswordSet,
  setRevealPasswordHash,
  verifyRevealPassword,
  getStoredRevealPasswordHash,
} from '../../storage/revealPassword'

const MIN_LENGTH = 12

export default class KeyRevealSetup extends Command {
  static description = 'Set or change the reveal password required to view private keys via key:get or key:list --reveal-private'

  async run() {
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      CliUx.ux.error('This command must be run in an interactive terminal.')
    }

    if (isRevealPasswordSet()) {
      CliUx.ux.log(yellow('A reveal password is already set. Enter the current one to change it.'))
      const current = await CliUx.ux.prompt('Current reveal password', { type: 'hide' })
      const stored = getStoredRevealPasswordHash()!
      if (!verifyRevealPassword(current, stored)) {
        CliUx.ux.error('Current reveal password is incorrect.')
      }
    } else {
      CliUx.ux.log('Setting a reveal password. This will be required whenever a private key is revealed via key:get or key:list --reveal-private.')
      CliUx.ux.log(yellow('Use a password you keep only in your head. Do not share it with AI agents, pair programmers, or scripts.'))
    }

    const pw1 = await CliUx.ux.prompt(`New reveal password (min ${MIN_LENGTH} chars)`, { type: 'hide' })
    if (pw1.length < MIN_LENGTH) {
      CliUx.ux.error(`Password must be at least ${MIN_LENGTH} characters.`)
    }
    const pw2 = await CliUx.ux.prompt('Confirm reveal password', { type: 'hide' })
    if (pw1 !== pw2) {
      CliUx.ux.error('Passwords do not match.')
    }

    setRevealPasswordHash(hashRevealPassword(pw1))
    CliUx.ux.log(green('Success: reveal password set. key:get and key:list --reveal-private will now prompt for it.'))
  }

  async catch(e: Error) {
    CliUx.ux.error(red(e.message))
  }
}
