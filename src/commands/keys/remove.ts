import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { Key } from '@proton/js'
import { green, red } from 'colors'
import passwordManager from '../../storage/passwordManager'

export default class RemoveKey extends Command {
  static description = 'Remove Key'

  static args = [
    {name: 'privateKey', required: false},
  ]

  async run() {
    const {args} = this.parse(RemoveKey)

    // Prompt if needed
    if (!args.privateKey) {
      args.privateKey = await CliUx.ux.prompt('Enter private key to delete (starts with PVT_K1)', { type: 'hide' })
    }

    // Confirm
    const confirmed = await CliUx.ux.confirm('Are you sure you want to delete this private key? (yes/no)')
    if (!confirmed) {
      return
    }

    // Remove
    await passwordManager.removePrivateKey(args.privateKey)

    // Log
    CliUx.ux.log(`${green('Success:')} Removed private key for public key ${Key.PrivateKey.fromString(args.privateKey).getPublicKey()}`)
  }

  async catch(e: Error) {
    CliUx.ux.error(red(e.message))
  }
}
