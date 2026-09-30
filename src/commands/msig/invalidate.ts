import {Command} from '@oclif/command'
import {CliUx} from '@oclif/core'
import {network} from '../../storage/networks'
import {parseDetailsError} from '../../utils/detailsError'
import {parseAuthorization} from '../../utils/multisig'

export default class MultisigInvalidate extends Command {
  static description = 'Invalidate Multisig Proposals'

  static args = [
    {name: 'account', required: true, help: 'Account whose proposals should be invalidated'},
    {name: 'auth', required: true, help: 'Signing authorization (e.g. user1@active)'},
  ]

  async run(): Promise<void> {
    const {args} = this.parse(MultisigInvalidate)
    const authorization = parseAuthorization(args.auth)

    await network.transact({
      actions: [{
        account: 'eosio.msig',
        name: 'invalidate',
        data: {account: args.account},
        authorization: [authorization],
      }],
    })

    CliUx.ux.log(`Multisig proposals for ${args.account} successfully invalidated.`)
  }

  async catch(e: Error | any): Promise<void> {
    parseDetailsError(e)
  }
}
