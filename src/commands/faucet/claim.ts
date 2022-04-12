import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { green } from 'colors'
import { getFaucets } from '../../apis/getFaucets'
import { network } from '../../storage/networks'

export default class ClaimFaucet extends Command {
  static description = 'Claim faucet'

  static args = [
    { name: 'symbol', required: true },
    { name: 'authorization', required: true, description: 'Authorization like account1@active' },
  ]

  async run() {
    const { args } = this.parse(ClaimFaucet)

    const faucets = await getFaucets()
    const faucet = faucets.find(faucet => faucet.claimToken.quantity.split(' ')[1] === args.symbol)
    if (!faucet) {
      throw new Error(`No faucet with symbol ${args.symbol} found`)
    }

    const [actor, permission] = args.authorization.split('@')

    await network.transact({
      actions: [{
        account: 'token.faucet',
        name: 'claim',
        data: {
          programId: faucet.index,
          account: actor
        },
        authorization: [{
          actor,
          permission: permission || 'active'
        }]
      }]
    })

    CliUx.ux.log(`${green('Success:')} Faucet claimed`)
  }
}
