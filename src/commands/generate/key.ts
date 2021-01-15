import {Key, Numeric} from '@protonprotocol/protonjs'
import {Command} from '@oclif/command'
import {ux} from 'cli-ux'

export default class GenerateKey extends Command {
  static description = 'Generate Key'

  async run() {
    const {privateKey, publicKey} = Key.generateKeyPair(Numeric.KeyType.k1, {secureEnv: true})
    ux.styledJSON({
      publicKey: publicKey.toString(),
      publicKeyOld: publicKey.toLegacyString(),
      privateKey: privateKey.toString(),
      privateKeyOld: privateKey.toLegacyString(),
    })
  }
}
