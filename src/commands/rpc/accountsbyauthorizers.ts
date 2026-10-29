import { Args, Command } from '@oclif/core'
import { ux } from '../../utils/ux'

import { network } from '../../storage/networks'

export default class AccountsByAuthorizer extends Command {
  static description = 'Get Accounts by Authorization'

  static args = {
    authorizations: Args.string({
      required: true,
      description: 'JSON-encoded list of {actor, permission} authorizations',
    }),
    keys: Args.string({
      required: false,
      description: 'JSON-encoded list of public keys',
    }),
  }

  async run() {
    const { args } = await this.parse(AccountsByAuthorizer)
    const parsedAuth = JSON.parse(args.authorizations)
    const authorizations = Array.isArray(parsedAuth) ? parsedAuth : [parsedAuth]
    const keys: string[] = args.keys ? JSON.parse(args.keys) : []
    const res = await network.rpc.get_accounts_by_authorizers(authorizations, keys)
    await ux.styledJSON(res)
  }
}
