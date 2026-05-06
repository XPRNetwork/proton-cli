import { Command, Flags, Args } from '@oclif/core'
import { ux } from '../../utils/ux'
import { parseUtcTimestamp } from '@bloks/numbers'

import { cyan } from 'colors'
import { network } from '../../storage/networks'
import dedent from 'ts-dedent'
import { parsePermissions } from '../../utils/permissions'
import { generateResourceTable } from '../../utils/resources'
import { getLightAccount, getLightBalances } from '../../apis/lightApi'

export default class GetAccount extends Command {
  static description = 'Get Account Information'

  static args = {
    account: Args.string({
      required: true,
    }),
  }

  static flags = {
    raw: Flags.boolean({ char: 'r', default: false }),
    tokens: Flags.boolean({ char: 't', default: false, description: 'Show token balances' }),
  }

  async run() {
    const { args, flags } = await this.parse(GetAccount)

    const [account, lightAccount, balances] = await Promise.all([
      network.rpc.get_account(args.account),
      getLightAccount(args.account),
      flags.tokens ? getLightBalances(args.account) : undefined
    ])

    if (flags.raw) {
      ux.styledJSON(account)
    } else {
      ux.log(dedent`
        ${cyan('Created:')}
        ${parseUtcTimestamp(account.created)}

        ${cyan('Permissions:')}
        ${parsePermissions(account.permissions, lightAccount)}

        ${cyan('Resources:')}
        ${generateResourceTable(account)}

        ${account.voter_info && account.voter_info.producers && account.voter_info.producers.length
          ? dedent`
            ${cyan('Voting For:')}
            ${account.voter_info.producers.join(', ')}
          `
          : ''
        }

        ${balances && flags.tokens
          ? dedent`
            ${cyan('Tokens:')} ${
              balances
                .filter(balance => +balance.amount.split(' ')[0] > 0)
                .map(balance => `\n${balance.amount} ${balance.currency} - ${balance.contract}`).join('')
            }
          `
          : ''
        }
      `.trim())
    }
  }
}
