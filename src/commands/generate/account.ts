import {Key, Numeric} from '@proton/js'
import { Command } from '@oclif/command'
import {CliUx} from '@oclif/core'

export default class GenerateKey extends Command {
  static description = 'Generate Key'

  async run() {
    const {privateKey, publicKey} = Key.generateKeyPair(Numeric.KeyType.k1, {secureEnv: true})
    CliUx.ux.log('\nPlease store private key securely:')
    CliUx.ux.styledJSON({
      public: publicKey.toString(),
      private: privateKey.toString(),
    })
  }
}
