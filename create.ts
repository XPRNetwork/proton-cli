import { parseCpu, parseNetAndRam, parseUtcTimestamp } from '@bloks/numbers'
import { Command, flags } from '@oclif/command'
import {CliUx} from '@oclif/core'
import { cyan, green } from 'colors'
import { network } from './src/storage/networks'
import dedent from 'ts-dedent'
import { Mnemonic } from '@proton/mnemonic'

export default class GetAccount extends Command {
  static description = 'Get Account Information'

  static args = [
    { name: 'accountName', required: true, help: 'Account name' },
  ]

  async run() {
    const {args} = this.parse(GetAccount)


    const account = await network.rpc.get_account(args.accountName)

    const mnemonic = new Mnemonic({
      numWords: 12,
    })
    const { publicKey, privateKey } = mnemonic.keyPairAtIndex(0)

    const createAccountParams = {
      email: email.value,
      name: displayName.value,
      chainAccount: actor.value,
      ownerPublicKey: mnemonicPubKey,
      activePublicKey: decodedKey.value!.isEcc
        ? decodedKey.value!.key
        : mnemonicPubKey,
      verificationCode: verificationCode.value
    }
    console.log('createAccountParams', createAccountParams)

    const res = await createAccount(createAccountParams)
    console.log(res)

    // Exit early if error
    if (res.error) {
      if (res.error === 'mfa_required') {
        waitingFor.value = WaitingStates.verificationCode
      } else {
        alert(res.message)
      }

      loading.value = false
      return
    }

  }
}
