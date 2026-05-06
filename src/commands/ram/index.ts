import { Command } from '@oclif/core'
import { ux } from '../../utils/ux'

import { getRamPrice } from '../../apis/getRamPrice'

export default class Ram extends Command {
  static description = 'List Ram price'

  async run() {
    const ramPrice = await getRamPrice()
    ux.log(`RAM costs ${ramPrice.toFixed(4)} XPR / byte`)
    ux.log(`RAM costs ${(ramPrice * 1024).toFixed(4)} XPR / KB`)
  }
}
