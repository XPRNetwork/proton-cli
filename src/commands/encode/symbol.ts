import { Command, Args } from '@oclif/core'
import { ux } from '../../utils/ux'

import { Asset } from '@greymass/eosio'
import { parseDetailsError } from '../../utils/detailsError'

export default class EncodeSymbol extends Command {
  static description = 'Encode Symbol'

  static args = {
    symbol: Args.string({
      required: true,
    }),
    precision: Args.string({
      required: true,
    }),
  }

  async run() {
    const { args } = await this.parse(EncodeSymbol)
    ux.log(`${Asset.Symbol.fromParts(args.symbol, parseInt(args.precision, 10)).value}`)
  }

  async catch(e: Error | any) {
    parseDetailsError(e)
  }
}

