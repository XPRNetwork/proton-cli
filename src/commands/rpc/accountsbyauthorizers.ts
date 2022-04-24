import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { network } from '../../storage/networks'

export default class AccountsByAuthorizer extends Command {
  static description = 'Get Accounts by Authorization'

  static args = [
    {
      name: 'authorizations', required: true, default: [], parse: (input: string) => {
        const parsed = JSON.parse(input)
        return Array.isArray(parsed) ? parsed : [parsed]
      }
    },
    { name: 'keys', required: false, default: [] },
  ]

  async run() {
    const { args } = this.parse(AccountsByAuthorizer)
    console.log(args.authorizations, args.keys)
    const res = await network.rpc.get_accounts_by_authorizers(args.authorizations, args.keys)
    await CliUx.ux.styledJSON(res)
  }
}
