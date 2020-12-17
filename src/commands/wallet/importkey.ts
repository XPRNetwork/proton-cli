import {Command} from '@oclif/command'
import {Keosd, Key} from '@protonprotocol/protonjs'
import cli, {ux} from 'cli-ux'

export default class ImportKeyWallet extends Command {
  static description = 'Import private key to wallet'

  static args = [
    {name: 'name', default: 'default'},
    {name: 'private_key'},
  ]

  async run() {
    const {args} = this.parse(ImportKeyWallet)
    if (!args.private_key) {
      args.private_key = await cli.prompt('Enter private key', {type: 'hide'})
    }
    await Keosd.wallet_import_key(args.name, args.private_key)

    const importedPublicKey = Key.PrivateKey.fromString(args.private_key).getPublicKey()
    this.log(`Key Successfully Imported: ${importedPublicKey.toString()} (${importedPublicKey.toLegacyString()})`)
  }

  async catch(error: any) {
    const {args} = this.parse(ImportKeyWallet)
    if (error.error.what === `Key already exists in wakket ${args.name}`) {
      this.log(error.error.what)
    } else {
      ux.styledJSON(error)
    }
  }
}
