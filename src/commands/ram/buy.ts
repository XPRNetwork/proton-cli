import { Command, flags } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { green } from 'colors'
import { network } from '../../storage/networks'
import { parseDetailsError } from '../../utils/detailsError'

export default class RamBuy extends Command {
  static description = 'Buy RAM for an account'

  static examples = [
    '$ proton ram:buy myaccount myaccount 10000',
    '$ proton ram:buy payer receiver 50000 -p payer@active',
  ]

  static args = [
    { name: 'buyer', required: true, description: 'Account paying for RAM' },
    { name: 'receiver', required: true, description: 'Account receiving RAM' },
    { name: 'bytes', required: true, description: 'Number of bytes of RAM to purchase' },
  ]

  static flags = {
    authorization: flags.string({
      char: 'p',
      description: 'Authorization to use (e.g., account@active). Defaults to buyer@active',
    }),
  }

  async run() {
    const { args, flags } = this.parse(RamBuy)

    const [actor, permission] = flags.authorization
      ? flags.authorization.split('@')
      : [args.buyer]

    try {
      const res = await network.transact({
        actions: [{
          account: 'eosio',
          name: 'buyrambytes',
          data: {
            payer: actor,
            receiver: args.receiver,
            bytes: Number(args.bytes),
          },
          authorization: [{
            actor,
            permission: permission || 'active'
          }]
        }]
      })

      CliUx.ux.log(`${green('Success:')} Purchased ${args.bytes} bytes of RAM for ${args.receiver}`)
    } catch (e) {
      parseDetailsError(e)
    }
  }
}
