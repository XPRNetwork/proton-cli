import { Command, Args } from '@oclif/core'
import { ux } from '../../utils/ux'

import { network } from '../../storage/networks'
import dedent from 'ts-dedent'
import { ABI } from '@greymass/eosio'
import { parseDetailsError } from '../../utils/detailsError'

export default class Action extends Command {
  static description = 'Execute Action'

  static args = {
    contract: Args.string({
      required: true,
    }),
    action: Args.string({
      required: false,
    }),
    data: Args.string({
      required: false,
    }),
    authorization: Args.string({
      required: false,
      description: 'Account to authorize with',
    }),
  }

  async run() {
    const { args } = await this.parse(Action)

    // Get ABI
    const { abi: rawAbi } = await network.rpc.get_abi(args.contract)
    const abi = ABI.from(rawAbi)

    // Guided flow
    if (!args.action) {
      const availableActions = rawAbi.actions.map((a) => {
        const resolved = abi.resolveType(a.name);
        const fields = resolved.fields!.map(field => `${field.name}: ${field.type.name}`).join(', ')
        return `• ${a.name} (${fields})`
      }).join('\n')

      ux.log(dedent`
        Available actions:
        ${availableActions}
      `)
      return
    }

    // Resolved action
    const resolvedAction = abi.resolveType(args.action);

    // Check data
    if (!args.data) {
      const fields = resolvedAction.fields!.map(field => `${field.name}: ${field.type.name}`).join(', ')
      throw new Error(`Missing ${resolvedAction.name} data: { ${fields} }`)
    }

    // Check authorization
    if (!args.authorization) {
      throw new Error('Authorization missing (e.g. account@active)')
    }

    // Create authorization
    const [actor, permission] = args.authorization.split('@')
    const authorization = [{
      actor,
      permission: permission || 'active'
    }]

    // Set data
    const data: any = {}
    const parsedArgsData = JSON.parse(args.data)

    if (Array.isArray(parsedArgsData)) {
      for (const [i, dataArg] of JSON.parse(args.data).entries()) {
        data[resolvedAction.fields![i].name] = dataArg
      }
    } else {
      for (const field of resolvedAction.fields!) {
        if (!field.type.isOptional && !parsedArgsData.hasOwnProperty(field.name)) {
          throw new Error(`Missing field ${field.name} on action ${resolvedAction.name}`);
        }

        if (parsedArgsData.hasOwnProperty(field.name)) {
          data[field.name] = parsedArgsData[field.name]
        }
      }
    }

    // Fetch rows
    const result = await network.transact({
      actions: [{
        account: args.contract,
        name: args.action,
        data,
        authorization
      }]
    })
    ux.styledJSON(result)
  }

  async catch(e: Error | any) {
    parseDetailsError(e)
  }
}

