import { Command } from '@oclif/command'
import {CliUx} from '@oclif/core'
import { Mnemonic } from '@proton/mnemonic'
import { red, yellow } from 'colors'

export default class GenerateKey extends Command {
  static description = 'Generate Key'

  async run() {
    const mnemonic = new Mnemonic({
      numWords: 12,
    })
    const { publicKey, privateKey } = mnemonic.keyPairAtIndex(0)

    CliUx.ux.log(`\n${yellow('Note:')} Please store private key or mnemonic securely!`)
    CliUx.ux.styledJSON({
      public: publicKey.toString(),
      private: privateKey.toString(),
      mnemonic: mnemonic.phrase 
    })
  }

  async catch(e: Error) {
    CliUx.ux.error(red(e.message))
  }
}
