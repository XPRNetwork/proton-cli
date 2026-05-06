import { Command } from '@oclif/core'
import { ux } from '../../utils/ux'

import { getFaucets } from '../../apis/getFaucets'

export default class Faucet extends Command {
  static description = 'List all faucets'

  async run() {
    const faucets = await getFaucets()
    for (const faucet of faucets) {
      const [claimAmount, claimSymbol] = faucet.claimToken.quantity.split(' ')
      ux.log(`${claimSymbol}: Claim ${claimAmount} every ${faucet.duration} seconds`)
    }
  }
}
