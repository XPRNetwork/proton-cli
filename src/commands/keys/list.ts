import { Command } from '@oclif/command'
import {CliUx} from '@oclif/core'
import { Key } from '@proton/js'
import passwordManager from '../../storage/passwordManager'

export default class GenerateKey extends Command {
  static description = 'Generate Key'

  async run() {
    const privateKeys = await passwordManager.getPrivateKeys()
    const displayKeys = privateKeys.map(privateKey => {
      const parsedPrivateKey = Key.PrivateKey.fromString(privateKey)

      return {
        publicKey: parsedPrivateKey.getPublicKey().toString(),
        privateKey: parsedPrivateKey.toString()
      }
    })
    CliUx.ux.styledJSON(displayKeys);
  }
}
