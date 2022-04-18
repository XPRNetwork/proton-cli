import { Command, flags } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { Serialize } from '@proton/js'
import { network } from '../../storage/networks'
import { config } from '../../storage/config'
import { green } from 'colors'
import { parseDetailsError } from '../../utils/detailsError'
import { getExplorer } from '../../apis/getExplorer'

function getDeployableFilesFromDir(dir: string) {
  const dirCont = readdirSync(dir)
  const wasms = dirCont.filter(filePath => filePath.match(/.*\.(wasm)$/gi) as any)
  const abis = dirCont.filter(filePath => filePath.match(/.*\.(abi)$/gi) as any)

  // Validation
  if (wasms.length === 0) {
    throw new Error(`Cannot find a ".wasm file" in ${dir}`)
  }
  if (abis.length === 0) {
    throw new Error(`Cannot find a ".abi file" in ${dir}`)
  }
  if (wasms.length > 1 || abis.length > 1) {
    throw new Error(`Directory ${dir} must contain only 1 WASM and 1 ABI`)
  }

  return {
    wasmPath: join(dir, wasms[0]),
    abiPath: join(dir, abis[0]),
  }
}

export default class SetContract extends Command {
  static description = 'Set Contract'

  static args = [
    { name: 'account', required: true, help: 'The account to publish the contract to' },
    { name: 'directory', required: true, help: 'Path of directory with WASM and ABI' },
  ]

  static flags = {
    clear: flags.boolean({ char: 'c', description: 'Removes WASM + ABI from contract' }),
    abiOnly: flags.boolean({ char: 'a', description: 'Only deploy ABI' }),
    wasmOnly: flags.boolean({ char: 'w', description: 'Only deploy WASM' }),
  }

  async run() {
    const { args, flags } = this.parse(SetContract)

    let wasm: Buffer = Buffer.from('')
    let abi: string = ''

    // If not clearing, find files
    if (!flags.clear) {
      // 0. Get path of WASM and ABI
      const { wasmPath, abiPath } = getDeployableFilesFromDir(args.directory)

      // 1. Prepare SETCODE
      // read the file and make a hex string out of it
      wasm = readFileSync(wasmPath)

      // 2. Prepare SETABI
      const abiBuffer = new Serialize.SerialBuffer()
      const abiDefinition = network.api.abiTypes.get('abi_def')!
      abiDefinition.serialize(
        abiBuffer,
        abiDefinition.fields.reduce(
          (acc: any, { name: fieldName }: any) => {
            return Object.assign(acc, {
              [fieldName]: acc[fieldName] || [],
            })
          }, JSON.parse(readFileSync(abiPath, 'utf8'))
        )
      )
      abi = Buffer.from(abiBuffer.asUint8Array()).toString('hex')
    }

    const deployText = flags.clear ? 'Cleared' : 'Deployed'

    // 3. Set code
    if (!flags.abiOnly) {
      try {
        const res = await network.transact({
          actions: [{
            account: 'eosio',
            name: 'setcode',
            data: {
              account: args.account,
              vmtype: 0,
              vmversion: 0,
              code: wasm,
            },
            authorization: [{
              actor: args.account,
              permission: 'active',
            }],
          }],
        })
        await CliUx.ux.log(green(`WASM Successfully ${deployText}:`))
        await CliUx.ux.url(`View TX`, `https://${config.get('currentChain')}.bloks.io/tx/${(res as any).transaction_id}?tab=traces`)
      } catch (e) {
        parseDetailsError(e)
      }
    }

    // 4. Set ABI
    if (!flags.wasmOnly) {
      try {
        const res = await network.transact({
          actions: [{
            account: 'eosio',
            name: 'setabi',
            data: {
              account: args.account,
              abi: abi,
            },
            authorization: [{
              actor: args.account,
              permission: 'active',
            }],
          }],
        })
        await CliUx.ux.log(green(`ABI Successfully ${deployText}:`))
        await CliUx.ux.url(`View TX`, `${getExplorer()}/tx/${(res as any).transaction_id}?tab=traces`)
      } catch (e) {
        parseDetailsError(e)
      }
    }
  }
}
