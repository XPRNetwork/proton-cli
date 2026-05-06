import { Command, Flags, Args } from '@oclif/core'
import { ux } from '../../utils/ux'

import { green } from 'colors'
import { network } from '../../storage/networks'
import { parseDetailsError } from '../../utils/detailsError'

export default class RamBuy extends Command {
  static description = 'Buy RAM for an account'

  static examples = [
    '$ proton ram:buy myaccount myaccount 10000',
    '$ proton ram:buy payer receiver 50000 -p payer@active',
  ]

  static args = {
    buyer: Args.string({
      required: true,
      description: 'Account paying for RAM',
    }),
    receiver: Args.string({
      required: true,
      description: 'Account receiving RAM',
    }),
    bytes: Args.string({
      required: true,
      description: 'Number of bytes of RAM to purchase',
    }),
  }

  static flags = {
    authorization: Flags.string({
      char: 'p',
      description: 'Authorization to use (e.g., account@active). Defaults to buyer@active'
    }),
  }

  async run() {
    const { args, flags } = await this.parse(RamBuy)

    const [actor, permission] = flags.authorization
      ? flags.authorization.split('@')
      : [args.buyer]

    try {
      await network.transact({
        actions: [{
          account: 'eosio',
          name: 'buyrambytes',
          data: {
            payer: actor,
            receiver: args.receiver,
            bytes: args.bytes,
          },
          authorization: [{
            actor,
            permission: permission || 'active'
          }]
        }]
      })

      ux.log(green('✓ RAM Purchased'))
      ux.log(`  Buyer: ${actor}`)
      ux.log(`  Receiver: ${args.receiver}`)
      ux.log(`  Bytes: ${Number(args.bytes).toLocaleString()}`)
    } catch (error) {
      parseDetailsError(error)
    }
  }
}
