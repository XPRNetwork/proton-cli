import { Command } from '@oclif/command'
import { network } from '../../networks'
import cli, {ux} from 'cli-ux'
import { config } from '../../storage/config'

export default class Dappreg extends Command {
  static description = 'Set Contract'

  static args = [
    {name: 'account', required: true, help: 'The account to register as dapp'},
  ]

  async run() {
    const {args} = this.parse(Dappreg)

    const res = await network.transact([
      {
        account: 'eosio.proton',
        name: 'dappreg',
        authorization: [{
          actor: args.account,
          permission: 'active',
        }],
        data: {
          account: args.account,
        },
      },
    ])

    this.log('Transaction Successful')
    await cli.url('View Transaction on Bloks.io', `https://${config.get('currentChain')}.bloks.io/transaction/${(res as any).transaction_id}`)
  }

  async catch(e: Error) {
    ux.styledJSON(e)
  }
}
