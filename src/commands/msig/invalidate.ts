import {Args, Command} from '@oclif/core'
import {network} from '../../storage/networks'
import {parseDetailsError} from '../../utils/detailsError'
import {parseAuthorization} from '../../utils/multisig'
import {ux} from '../../utils/ux'

export default class MultisigInvalidate extends Command {
  static description = 'Invalidate Multisig Proposals'

  static args = {
    auth: Args.string({required: true, help: 'Authorization of the account whose approvals should be invalidated (e.g. user1@active)'}),
  }

  async run(): Promise<void> {
    const {args} = await this.parse(MultisigInvalidate)
    const authorization = parseAuthorization(args.auth)

    await network.transact({
      actions: [{
        account: 'eosio.msig',
        name: 'invalidate',
        data: {account: authorization.actor},
        authorization: [authorization],
      }],
    })

    ux.log(`Multisig proposals for ${authorization.actor} successfully invalidated.`)
  }

  async catch(e: Error | any): Promise<void> {
    parseDetailsError(e)
    return this.error(e instanceof Error ? e.message : String(e), {exit: 1})
  }
}
