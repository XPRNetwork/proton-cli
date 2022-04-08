import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { green, red } from 'colors'
import { config } from '../../storage/config'

export default class ResetKey extends Command {
  static description = 'Reset password (Caution: deletes all private keys stored)'

  async run() {
    const confirmed = await CliUx.ux.confirm(`${red('Caution:')} Are you sure you want to delete all your private keys? (yes/no)`)
    if (!confirmed) {
      return
    }

    const doubleConfirmed = await CliUx.ux.confirm(`${red('Caution:')} Are you REALLY sure? There is no coming back from this (yes/no)`)
    if (!doubleConfirmed) {
      return
    }

    config.reset('privateKeys', 'isLocked')
    CliUx.ux.log(`${green('Success:')} Reset password and deleted all stored private keys.`)
  }

  async catch(e: Error) {
    CliUx.ux.error(red(e.message))
  }
}
