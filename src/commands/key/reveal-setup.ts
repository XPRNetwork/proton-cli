import { Command } from '@oclif/core'
import { ux } from '../../utils/ux'

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
      ux.error('This command must be run in an interactive terminal.')
    }

    if (isRevealPasswordSet()) {
      ux.log(yellow('A reveal password is already set. Enter the current one to change it.'))
      const current = await ux.prompt('Current reveal password', { type: 'hide' })
      const stored = getStoredRevealPasswordHash()!
      if (!verifyRevealPassword(current, stored)) {
        ux.error('Current reveal password is incorrect.')
      }
    } else {
      ux.log('Setting a reveal password. This will be required whenever a private key is revealed via key:get or key:list --reveal-private.')
      ux.log(yellow('Use a password you keep only in your head. Do not share it with AI agents, pair programmers, or scripts.'))
    }

    const pw1 = await ux.prompt(`New reveal password (min ${MIN_LENGTH} chars)`, { type: 'hide' })
    if (pw1.length < MIN_LENGTH) {
      ux.error(`Password must be at least ${MIN_LENGTH} characters.`)
    }
    const pw2 = await ux.prompt('Confirm reveal password', { type: 'hide' })
    if (pw1 !== pw2) {
      ux.error('Passwords do not match.')
    }

    setRevealPasswordHash(hashRevealPassword(pw1))
    ux.log(green('Success: reveal password set. key:get and key:list --reveal-private will now prompt for it.'))
  }

  async catch(e: Error) {
    ux.error(red(e.message))
  }
}
