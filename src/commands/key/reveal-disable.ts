import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { green, red } from 'colors'
import {
  clearRevealPasswordHash,
  getStoredRevealPasswordHash,
  isRevealPasswordSet,
  verifyRevealPassword,
} from '../../storage/revealPassword'

export default class KeyRevealDisable extends Command {
  static description = 'Remove the reveal password (requires entering the current one)'

  async run() {
    if (!isRevealPasswordSet()) {
      CliUx.ux.log('No reveal password is set.')
      return
    }
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      CliUx.ux.error('This command must be run in an interactive terminal.')
    }

    const current = await CliUx.ux.prompt('Current reveal password', { type: 'hide' })
    const stored = getStoredRevealPasswordHash()!
    if (!verifyRevealPassword(current, stored)) {
      CliUx.ux.error('Current reveal password is incorrect.')
    }

    clearRevealPasswordHash()
    CliUx.ux.log(green('Success: reveal password removed. key:get and key:list --reveal-private will no longer prompt for it.'))
  }

  async catch(e: Error) {
    CliUx.ux.error(red(e.message))
  }
}
