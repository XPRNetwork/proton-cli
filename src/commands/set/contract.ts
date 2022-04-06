/* eslint-disable no-console */
import { Command } from '@oclif/command'
import {getApi} from '../../networks'
import {ux} from 'cli-ux'
import {readdirSync, readFileSync} from 'fs'
import {join} from 'path'
import {Serialize} from '@proton/js'

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

export default class SetContract extends Command {
  static description = 'Set Contract'

  static args = [
    {name: 'account', required: true, help: 'The account to publish the contract to'},
    {name: 'directory', required: true, help: 'Path of directory with WASM and ABI'},
  ]

  async run() {
    const {args} = this.parse(SetContract)
    const {api, transact} = await getApi()

    // 0. Get path of WASM and ABI
    const {wasmPath, abiPath} = getDeployableFilesFromDir(args.directory)

    // 1. Prepare SETCODE
    // read the file and make a hex string out of it
    const wasm = readFileSync(wasmPath).toString('hex')

    // 2. Prepare SETABI
    const abiBuffer = new Serialize.SerialBuffer()
    const abiDefinition = api.abiTypes.get('abi_def')!
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
      const wasmRes = await transact([
        {
          account: 'eosio',
          name: 'setcode',
          authorization: [{
            actor: args.account,
            permission: 'active',
          }],
          data: {
            account: args.account,
            vmtype: 0,
            vmversion: 0,
            code: wasm,
          },
        },
      ])
      ux.styledJSON(wasmRes)
    } catch (error) {
      console.log('Set WASM failed')
      ux.styledJSON(error)
    }

    // 4. Set ABI
    try {
      const abiRes = await transact([
        {
          account: 'eosio',
          name: 'setabi',
          authorization: [{
            actor: args.account,
            permission: 'active',
          }],
          data: {
            account: args.account,
            abi: Buffer.from(abiBuffer.asUint8Array()).toString('hex'),
          },
        },
      ])
      ux.styledJSON(abiRes)
    } catch (error) {
      console.log('Set abi failed')
      ux.styledJSON(error)
    }
  }
}
