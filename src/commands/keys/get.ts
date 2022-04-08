import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { green, red } from 'colors'
import passwordManager from '../../storage/passwordManager'

export default class GetPrivateKey extends Command {
  static description = 'Find private key for public key'

  static args = [
    {name: 'publicKey', required: true},
  ]

  async run() {
    const { args } = this.parse(GetPrivateKey)
    const privateKey = await passwordManager.getPrivateKey(args.publicKey)
    if (privateKey) {
      CliUx.ux.log(`${green('Success:')} ${privateKey}`)
    } else {
      CliUx.ux.log(`${red('Failure:')} No matching private key found in saved keys`)
    }
  }
}
