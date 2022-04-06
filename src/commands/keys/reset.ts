import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { red } from 'colors'
import { config } from '../../storage/config'

export default class ResetKey extends Command {
  static description = 'Reset password (CAUTION: deletes all private keys stored)'

  async run() {
    const confirmed = await CliUx.ux.confirm(`Are you sure you want to delete all your private keys? This is irreversible. (yes/no)`)
    if (!confirmed) {
      return
    }

    config.reset('privateKeys', 'isLocked')
    CliUx.ux.log('Deleted all stored private keys.')
  }

  async catch(e: Error) {
    CliUx.ux.error(red(e.message))
  }
}
