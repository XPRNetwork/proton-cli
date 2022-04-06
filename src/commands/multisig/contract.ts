/* eslint-disable no-console */
import { Command } from '@oclif/command'
import {readdirSync, readFileSync} from 'fs'
import {join} from 'path'
import {Serialize} from '@proton/js'
import { network } from '../../networks'

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

export default class MultisigContract extends Command {
  static description = 'Multisig Contract'

  static args = [
    {name: 'directory', required: true, help: 'Path of directory with WASM and ABI'},
  ]

  async run() {
    const {args} = this.parse(MultisigContract)

    // 0. Get path of WASM and ABI
    const {wasmPath, abiPath} = getDeployableFilesFromDir(args.directory)

    // 1. Prepare SETCODE
    // read the file and make a hex string out of it
    const wasm = readFileSync(wasmPath).toString('hex')
    this.log(`wasm: ${wasm}`)

    // 2. Prepare SETABI
    const abiBuffer = new Serialize.SerialBuffer()
    const abiDefinitions = network.api.abiTypes.get('abi_def')!

    let abiJSON = JSON.parse(readFileSync(abiPath, 'utf8'))

    abiJSON = abiDefinitions.fields.reduce(
      (acc: any, {name: fieldName}: any) =>
        Object.assign(acc, {[fieldName]: acc[fieldName] || []}),
      abiJSON
    )
    abiDefinitions.serialize(abiBuffer, abiJSON)
    const serializedAbiHexString = Buffer.from(abiBuffer.asUint8Array()).toString('hex')
    this.log(`abi: ${serializedAbiHexString}`)
  }
}
