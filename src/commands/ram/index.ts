import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { getRamPrice } from '../../apis/getRamPrice'

export default class Ram extends Command {
  static description = 'List Ram price'

  async run() {
    const ramPrice = await getRamPrice()
    CliUx.ux.log(`RAM costs ${ramPrice.toFixed(4)} XPR / byte`)
    CliUx.ux.log(`RAM costs ${(ramPrice * 1024).toFixed(4)} XPR / KB`)
  }
}
