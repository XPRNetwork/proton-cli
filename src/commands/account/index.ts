import { parseCpu, parseNetAndRam, parseUtcTimestamp } from '@bloks/numbers'
import { Command, flags } from '@oclif/command'
import {CliUx} from '@oclif/core'
import { cyan, green } from 'colors'
import { network } from '../../storage/networks'
import dedent from 'ts-dedent'
import { GetAccountResult } from '@proton/js/dist/rpc/types'
import { Key } from '@proton/js'

const parsePermissions = (permissions: any) => {
  let text = ''

  permissions = permissions.sort(
    (a: any, b: any) => a.perm_name === 'owner' ? -2 : a.perm_name === 'active' ? -1 : 0
  )

  let lastIndent = 0
  let lastParent = ''
  for (const permission of permissions) {
    if (lastParent !== permission.parent) {
      lastIndent += 2
      lastParent = permission.parent
    }
    if (lastParent !== '') {
      text += '\n\n'
    }
    text += '  '.repeat(lastIndent) + `${green(permission.perm_name)} (=${permission.required_auth.threshold}):    `
    text += permission.required_auth.keys.map((key: any) => '\n' + '  '.repeat(lastIndent) + ` +${key.weight} ${Key.PublicKey.fromString(key.key).toString()}`)
    text += permission.required_auth.accounts.map((account: any) => '\n' + '  '.repeat(lastIndent) + ` +${account.weight} ${account.permission.actor}@${account.permission.permission}`)
  }

  return text
}

const generateResourceTable = (account: GetAccountResult) => {
  const resourceTable = [
    {
      type: 'RAM',
      delegated: '',
      used: parseNetAndRam(+account.ram_usage),
      available: parseNetAndRam(+account.ram_quota - +account.ram_usage),
      max: parseNetAndRam(+account.ram_quota)
    },
    {
      type: 'CPU',
      delegated: account.total_resources.cpu_weight,
      used: parseCpu(+account.cpu_limit.current_used),
      available: parseCpu(+account.cpu_limit.available),
      max: parseCpu(+account.cpu_limit.max)
    },
    {
      type: 'NET',
      delegated: account.total_resources.net_weight,
      used: parseNetAndRam(+account.net_limit.current_used),
      available: parseNetAndRam(+account.net_limit.available),
      max: parseNetAndRam(+account.net_limit.max)
    }
  ]

  let resourceTableText = ""
  CliUx.ux.table(resourceTable, {
    type: {
      header: 'Type'
    },
    used: {
      header: 'Used'
    },
    available: {
      header: 'Available',
    },
    max: {
      header: 'Max',
    },
    delegated: {
      header: 'Delegated',
    }
  }, {
    printLine: (line) => { resourceTableText += line + '\n' },
  })
  return resourceTableText
}

export default class GetAccount extends Command {
  static description = 'Get Account Information'

  static args = [
    { name: 'accountName', required: true },
  ]

  static flags = {
    raw: flags.boolean({ char: 'r', default: false }),
  }

  async run() {
    const {args,flags} = this.parse(GetAccount)
    const account = await network.rpc.get_account(args.accountName)

    if (flags.raw) {
      CliUx.ux.styledJSON(account)
    } else {
      CliUx.ux.log(dedent`
        ${cyan('Created:')}
        ${parseUtcTimestamp(account.created)}

        ${cyan('Permissions:')}
        ${parsePermissions(account.permissions)}

        ${cyan('Resources:')}
        ${generateResourceTable(account)}

        ${account.voter_info
          ? dedent`
            ${cyan('Voting For:')}
            ${account.voter_info.producers.join(', ')}
          `
          : ''
        }
      `)
    }
  }
}
