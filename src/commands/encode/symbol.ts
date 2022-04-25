import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { Asset } from '@greymass/eosio'
import { parseDetailsError } from '../../utils/detailsError'

export default class EncodeSymbol extends Command {
  static description = 'Encode Symbol'

  static args = [
    { name: 'symbol', required: true },
    { name: 'precision', required: true },
  ]

  async run() {
    const { args } = this.parse(EncodeSymbol)
    CliUx.ux.log(`${Asset.Symbol.fromParts(args.symbol, args.precision).value}`)
  }

  async catch(e: Error | any) {
    parseDetailsError(e)
  }
}

