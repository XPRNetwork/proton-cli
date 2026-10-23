import {Command} from '@oclif/command'
import {CliUx} from '@oclif/core'
import {network} from '../../storage/networks'
import {parseDetailsError} from '../../utils/detailsError'
import {parseAuthorization} from '../../utils/multisig'

export default class MultisigInvalidate extends Command {
  static description = 'Invalidate Multisig Proposals'

  static args = [
    {name: 'auth', required: true, help: 'Authorization of the account whose approvals should be invalidated (e.g. user1@active)'},
  ]

  async run(): Promise<void> {
    const {args} = this.parse(MultisigInvalidate)
    const authorization = parseAuthorization(args.auth)

    await network.transact({
      actions: [{
        account: 'eosio.msig',
        name: 'invalidate',
        data: {account: authorization.actor},
        authorization: [authorization],
      }],
    })

    CliUx.ux.log(`Multisig proposals for ${authorization.actor} successfully invalidated.`)
  }

  async catch(e: Error | any): Promise<void> {
    parseDetailsError(e)
    return this.error(e instanceof Error ? e.message : String(e), {exit: 1})
  }
}
