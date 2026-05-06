import { Command, Flags, Args } from '@oclif/core'
import { ux } from '../../utils/ux'

import { network } from '../../storage/networks'
import { prompt } from 'inquirer'

export default class GetTable extends Command {
  static description = 'Get Table Storage Rows'

  static args = {
    contract: Args.string({
      required: true,
    }),
    table: Args.string({
      required: false,
    }),
    scope: Args.string({
      required: false,
    }),
  }

  static flags = {
    lowerBound: Flags.string({ char: 'l', default: undefined }),
    upperBound: Flags.string({ char: 'u', default: undefined }),
    keyType: Flags.string({ char: 'k', default: undefined }),
    reverse: Flags.boolean({ char: 'r', default: false }),
    showPayer: Flags.boolean({ char: 'p', default: false }),
    limit: Flags.integer({ char: 'c', default: 100 }),
    indexPosition: Flags.integer({ char: 'i', default: 1 }),
  }

  async run() {
    const { args, flags } = await this.parse(GetTable)

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
    ux.styledJSON(rows)
  }
}

