import { parseNetAndRam, parseCpu } from "@bloks/numbers"
import { CliUx } from "@oclif/core"
import { GetAccountResult } from "@proton/js/dist/rpc/types"

export const generateResourceTable = (account: GetAccountResult) => {
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
      delegated: account.total_resources?.cpu_weight,
      used: parseCpu(+account.cpu_limit.current_used),
      available: parseCpu(+account.cpu_limit.available),
      max: parseCpu(+account.cpu_limit.max)
    },
    {
      type: 'NET',
      delegated: account.total_resources?.net_weight,
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
  