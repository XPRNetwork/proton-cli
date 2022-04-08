/* eslint-disable no-console */
import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import {readdirSync, readFileSync} from 'fs'
import {join} from 'path'
import {Serialize} from '@proton/js'
import { network } from '../../storage/networks'

function getDeployableFilesFromDir(dir: string) {
  const dirCont = readdirSync(dir)
  const wasmFileName = dirCont.find(filePath => filePath.match(/.*\.(wasm)$/gi) as any)
  const abiFileName = dirCont.find(filePath => filePath.match(/.*\.(abi)$/gi) as any)
  if (!wasmFileName) throw new Error(`Cannot find a ".wasm file" in ${dir}`)
  if (!abiFileName) throw new Error(`Cannot find an ".abi file" in ${dir}`)
  return {
    wasmPath: join(dir, wasmFileName),
    abiPath: join(dir, abiFileName),
  }
}

export default class DeployContract extends Command {
  static description = 'Deploy Contract'

  static args = [
    {name: 'account', required: true, help: 'The account to publish the contract to'},
    {name: 'directory', required: true, help: 'Path of directory with WASM and ABI'},
  ]

  async run() {
    const {args} = this.parse(DeployContract)

    // 0. Get path of WASM and ABI
    const {wasmPath, abiPath} = getDeployableFilesFromDir(args.directory)

    // 1. Prepare SETCODE
    // read the file and make a hex string out of it
    const wasm = readFileSync(wasmPath).toString('hex')

    // 2. Prepare SETABI
    const abiBuffer = new Serialize.SerialBuffer()
    const abiDefinition = network.api.abiTypes.get('abi_def')!
    abiDefinition.serialize(
      abiBuffer,
      abiDefinition.fields.reduce(
        (acc: any, {name: fieldName}: any) => {
          return Object.assign(acc, {
            [fieldName]: acc[fieldName] || [],
          })
        }, JSON.parse(readFileSync(abiPath, 'utf8'))
      )
    )

    // 3. Set code
    try {
      const wasmRes = await network.transact({
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
      CliUx.ux.styledJSON(wasmRes)
    } catch (error) {
      console.log('Set WASM failed')
      CliUx.ux.styledJSON(error)
    }

    // 4. Set ABI
    try {
      const abiRes = await network.transact({
        actions: [{
          account: 'eosio',
          name: 'setabi',
          data: {
            account: args.account,
            abi: Buffer.from(abiBuffer.asUint8Array()).toString('hex'),
          },
          authorization: [{
            actor: args.account,
            permission: 'active',
          }],
        }],
      })
      CliUx.ux.styledJSON(abiRes)
    } catch (error) {
      console.log('Set abi failed')
      CliUx.ux.styledJSON(error)
    }
  }
}
