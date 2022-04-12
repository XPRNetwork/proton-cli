import { Command, flags } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { green } from 'colors'
import { network } from '../../storage/networks'

export default class ClaimFaucet extends Command {
  static description = 'Claim faucet'

  static args = [
    { name: 'buyer', required: true, description: 'Account paying for RAM' },
    { name: 'receiver', required: true, description: 'Account receiving RAM' },
    { name: 'bytes', required: true, description: 'Bytes of RAM to purchase' },
  ]

  static flags = {
    authorization: flags.string({ char: 'p', description: 'Use a specific authorization other than buyer@active' }),
  }

  async run() {
    const { args, flags } = this.parse(ClaimFaucet)

    const [actor, permission] = flags.authorization
      ? flags.authorization.split('@')
      : [args.buyer]

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

    CliUx.ux.log(`${green('Success:')} RAM Purchased`)
  }
}
