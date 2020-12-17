import {Command} from '@oclif/command'
import {Keosd} from '@protonprotocol/protonjs'
import cli, {ux} from 'cli-ux'

export default class UnlockWallet extends Command {
  static description = 'Unlock local wallet'

  static args = [
    {name: 'name', default: 'default'},
  ]

  async run() {
    const {args} = this.parse(UnlockWallet)
    const password = await cli.prompt(`Enter wallet password for wallet '${args.name}'`, {type: 'hide'})
    await Keosd.wallet_unlock(args.name, password)
    this.log(`Wallet ${args.name} sucessfully unlocked`)
  }

  async catch(error: any) {
    const {args} = this.parse(UnlockWallet)
    if (error.error.what === 'Already unlocked') {
      this.log(`Wallet ${args.name} is already unlocked`)
    } else {
      ux.styledJSON(error)
    }
  }
}
