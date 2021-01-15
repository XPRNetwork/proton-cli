import {Command} from '@oclif/command'
import {getApi, currentNetwork} from '../../networks'
import cli, {ux} from 'cli-ux'

export default class Dappreg extends Command {
  static description = 'Set Contract'

  static args = [
    {name: 'account', required: true, help: 'The account to register as dapp'},
  ]

  async run() {
    const {args} = this.parse(Dappreg)
    const {transact} = await getApi()
    const {chain} = await currentNetwork.get()

    const res = await transact([
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
    await cli.url('View Transaction on Bloks.io', `https://${chain}.bloks.io/transaction/${res.transaction_id}`)
  }

  async catch(e: Error) {
    ux.styledJSON(e)
  }
}
