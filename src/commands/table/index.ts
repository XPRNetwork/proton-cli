import { Command, flags } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { network } from '../../storage/networks'
import { prompt } from 'inquirer'

export default class GetTable extends Command {
  static description = 'Get Table Storage Rows'

  static args = [
    { name: 'contract', required: true },
    { name: 'table', required: false },
    { name: 'scope', required: false },
  ]

  static flags = {
    lowerBound: flags.string({ char: 'l', default: undefined }),
    upperBound: flags.string({ char: 'u', default: undefined }),
    keyType: flags.string({ char: 'k', default: undefined }),
    reverse: flags.boolean({ char: 'r', default: false }),
    showPayer: flags.boolean({ char: 'p', default: false }),
    limit: flags.integer({ char: 'c', default: 100 }),
    indexPosition: flags.integer({ char: 'i', default: 1 }),
  }

  async run() {
    const { args, flags } = this.parse(GetTable)

    // Have user choose table if not present
    if (!args.table) {
      const { abi: { tables } } = await network.rpc.get_abi(args.contract)
      const { table } = await prompt<{ table: string }>([
        {
          name: 'table',
          type: 'list',
          message: 'Which of these tables would you like to fetch?',
          choices: tables.map((t) => t.name),
        },
      ]);    
      args.table = table
    }

    // Fetch rows
    const rows = await network.rpc.get_table_rows({
      json: true,
      code: args.contract,
      scope: args.scope || args.contract,
      table: args.table,
      lower_bound: flags.lowerBound,
      upper_bound: flags.upperBound,
      index_position: flags.indexPosition,
      key_type: flags.keyType,
      limit: flags.limit,
      reverse: flags.reverse,
      show_payer: flags.showPayer,
    })
    CliUx.ux.styledJSON(rows)
  }
}

