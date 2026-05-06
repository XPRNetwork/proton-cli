import { Command } from '@oclif/core'
import { ux } from '../../utils/ux'

import { Mnemonic } from '@proton/mnemonic'
import { red, yellow } from 'colors'

export default class GenerateKey extends Command {
  static description = 'Generate Key'

  async run() {
    const mnemonic = new Mnemonic({
      numWords: 12,
    })
    const { publicKey, privateKey } = mnemonic.keyPairAtIndex(0)

    ux.log(`\n${yellow('Note:')} Please store private key or mnemonic securely!`)
    ux.styledJSON({
      public: publicKey.toString(),
      private: privateKey.toString(),
      mnemonic: mnemonic.phrase 
    })

    return privateKey
  }

  async catch(e: Error) {
    ux.error(red(e.message))
  }
}
