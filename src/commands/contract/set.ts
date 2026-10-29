import { Command, Flags } from '@oclif/core'
import { ux } from '../../utils/ux'

import {createWriteStream, mkdtemp, readdirSync, readFileSync, rmSync, unlink} from 'node:fs'
import path, {join, basename} from 'node:path'
import {prompt} from 'inquirer'
import {tmpdir} from 'node:os'
import https from 'node:https'
import {URL} from 'node:url'
import {Serialize, RpcInterfaces} from '@proton/js'
import {network} from '../../storage/networks'
import {green, red, yellow} from 'colors'
import {parseDetailsError} from '../../utils/detailsError'
import {getExplorer} from '../../apis/getExplorer'
import ContractEnableInline from './enableinline'
import isEqual from 'lodash.isequal'
import * as fs from 'node:fs'
import dotenv from 'dotenv'

const TIMEOUT = 10_000

function download(url: string, dest: string) {
  const uri = new URL(url)
  if (!dest) {
    dest = basename(uri.pathname)
  }

  return new Promise<string | void>((resolve, reject) => {
    const request = https.get(uri.href).on('response', res => {
      if (res.statusCode === 200) {
        const file = createWriteStream(dest, {flags: 'wx'})
        res.pipe(file)
        file
        .on('finish', () => {
          file.end()
          resolve()
        })
        .on('error', (err: any) => {
          file.destroy()
          unlink(dest, () => reject(err))
        })
      } else {
        reject(new Error(`Download request failed, response status: ${res.statusCode} ${res.statusMessage}`))
      }
    }).on('error', err => {
      reject(err)
    })
    request.setTimeout(TIMEOUT, function () {
      request.destroy()
      reject(new Error(`Request timeout after ${TIMEOUT / 1000}s`))
    })
  })
}

async function getDeployableFilesFromDir(dir: string) {
  let tmpFolder = ''

  if (/^https:\/\/github\.com/.test(dir)) {
    ux.log(yellow('The source is GitHub. Starting to download files...'))
    // The source is github need to fetch contract files first.

    const tmpFolderPromise = new Promise<string>((resolve, reject) => {
      mkdtemp(join(tmpdir(), 'foo-'), (err, folder) => {
        if (err) {
          reject(err)
        }

        resolve(folder)
      })
    })

    tmpFolder = await tmpFolderPromise
    const dirArr = dir.replace(/^https:\/\/github\.com\//, '').split('/')
    dirArr.splice(2, 1)
    const contractName = dirArr[dirArr.length - 1]

    const allDownloaded = await Promise.all(['wasm', 'abi'].map(ext => {
      const rawFile = `https://raw.githubusercontent.com/${dirArr.join('/')}/${contractName}.${ext}`
      return download(rawFile, join(tmpFolder, `${contractName}.${ext}`))
      .then(() => true)
      .catch(error => {
        ux.log(red(`Cannot download ${contractName}.${ext}: ${error}`))
        return false
      })
    }))

    if (allDownloaded.every(status => status)) {
      ux.log(green('Download completed'))
    }

    dir = tmpFolder
  }

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
    tmpFolder: tmpFolder,
  }
}

function extractStruct(abiStructs: RpcInterfaces.Abi['structs'], structName: string): RpcInterfaces.Abi['structs'][number] | undefined {
  return abiStructs.find(item => item.name === structName)
}

async function compareTables(existingABI: RpcInterfaces.Abi, newAbi: RpcInterfaces.Abi): Promise<{ removed: string[], updated: string[] }> {
  const existingTables = existingABI.tables
  const newTables = newAbi.tables

  const tablesToCheck = existingTables.reduce((accum: { removed: string[], updated: string[] }, table) => {
    if (newTables.findIndex(item => item.name === table.name) < 0) {
      accum.removed.push(table.name)
    } else {
      const existingStruct = extractStruct(existingABI.structs, table.type)
      const newStruct = extractStruct(newAbi.structs, table.type)
      if (!isEqual(existingStruct, newStruct)) {
        accum.updated.push(table.name)
      }
    }

    return accum
  }, {removed: [], updated: []})
  return tablesToCheck
}

async function checkDataExists(account: string, tables: string[]): Promise<string[]> {
  const data = await Promise.all(
    tables.map(
      async tableName => {
        let hasData: boolean
        try {
          const res = await network.rpc.get_table_by_scope({
            code: account,
            table: tableName,
          })
          hasData = res.rows.length > 0
        } catch {
          hasData = false
        }

        return hasData ? tableName : null
      }),
  )
  return data.filter(item => item !== null) as string[]
}

function readContractEnvFile(): Record<string, string> {
  const CURR_DIR = process.cwd()
  const contractPath = path.join(CURR_DIR, '.contract')

  if (fs.existsSync(contractPath)) {
    const contractEnvSource = fs.readFileSync(contractPath, 'utf-8')
    const contractEnv = dotenv.parse(contractEnvSource)

    if (Object.keys(contractEnv).length > 0) {
      ux.log(green('Found .contract file. Using arguments from the file.'))
    }

    return contractEnv
  }

  return {}
}

import { Args } from '@oclif/core'

export default class SetContract extends Command {
  static description = `Deploy Contract (WASM + ABI)

  `

  static args = {
    account: Args.string({
      required: false,
      description: 'The account to publish the contract to (or set ACCOUNT in .contract)',
    }),
    source: Args.string({
      required: false,
      description: 'Path of directory with WASM and ABI or GitHub folder URL (or set SOURCE in .contract)',
    }),
  }

  static flags = {
    clear: Flags.boolean({char: 'c', description: 'Removes WASM + ABI from contract'}), // ! remove the flag new command is implemented instead
    abiOnly: Flags.boolean({char: 'a', description: 'Only deploy ABI'}),
    wasmOnly: Flags.boolean({char: 'w', description: 'Only deploy WASM'}),
    disableInline: Flags.boolean({char: 's', description: 'Disable inline actions on contract'}),
  }

  async run() {
    const contractConfig = readContractEnvFile()

    let confirmed = false

    if (contractConfig.NETWORK && network.chain !== contractConfig.NETWORK) {
      return this.error(red(`Wrong network "${network.chain}". "${contractConfig.NETWORK}" is expected`))
    }

    const {args: argsInput, flags} = await this.parse(SetContract)

    const presetValues: Record<string, string> = {}
    if (contractConfig.ACCOUNT) {
      presetValues.account = contractConfig.ACCOUNT
      confirmed = true
    }
    if (contractConfig.SOURCE) {
      presetValues.source = contractConfig.SOURCE
    }

    let wasm: Buffer = Buffer.from('')
    let abi = ''
    let folderToCleanup = ''
    let warning = ''
    let canDeploy = true

    const args = { ...argsInput, ...presetValues } as { account: string; source: string }
    if (!args.account) {
      return this.error(red('Account is required (pass as the first arg or set ACCOUNT in .contract)'))
    }
    if (!flags.clear && !args.source) {
      return this.error(red('Source is required (pass as the second arg or set SOURCE in .contract)'))
    }

    if (!confirmed) {
      const {confirmedContract} = await prompt([
        {
          name: 'confirmedContract',
          type: 'confirm',
          message: `You are about to deploy to '${args.account}'. Continue?`,
          default: false,
        },
      ])

      confirmed = confirmedContract
    }

    if (confirmed) {
    // If not clearing, find files
      if (!flags.clear) {
      // 0. Get path of WASM and ABI
        const {wasmPath, abiPath, tmpFolder} = await getDeployableFilesFromDir(args.source)

        // 1. Prepare SETCODE
        // read the file and make a hex string out of it
        wasm = readFileSync(wasmPath)

        // 2. Prepare SETABI
        const abiBuffer = new Serialize.SerialBuffer()
        const abiDefinition = network.api.abiTypes.get('abi_def')!
        const abiFields = abiDefinition.fields.reduce(
          (acc: any, {name: fieldName}: any) => {
            return Object.assign(acc, {
              [fieldName]: acc[fieldName] || [],
            })
          }, JSON.parse(readFileSync(abiPath, 'utf8')),
        )
        ux.log(yellow('Checking for existing contract...'))
        const existingABI = await network.rpc.get_abi(args.account)

        if (existingABI.abi) {
          const tablesToCheck = await compareTables(existingABI.abi, abiFields)

          if (tablesToCheck.removed.length > 0) {
            const removedTables = await checkDataExists(args.account, tablesToCheck.removed)
            if (removedTables.length > 0) {
              warning += `The following tables you are going to remove have rows:\n    ${removedTables.join('\n    ')}\n`
            }
          }

          if (tablesToCheck.updated.length > 0) {
            const updatedTables = await checkDataExists(args.account, tablesToCheck.updated)
            if (updatedTables.length > 0) {
              warning += `The following tables you are going to change have rows:\n    ${updatedTables.join('\n    ')}\n`
            }
          }
        }

        if (warning) {
          ux.log(red(`${warning}Deploy of the contract may corrupt the data`))
          const {confirmedToContinue} = await prompt<{ confirmedToContinue: boolean }>([
            {
              name: 'confirmedToContinue',
              type: 'confirm',
              message: 'Are you sure you want to continue?',
              default: false,
            },
          ])
          canDeploy = confirmedToContinue
        } else {
          ux.log(green('No issue with the existing contract found. Continuing.'))
        }

        abiDefinition.serialize(
          abiBuffer,
          abiFields,
        )
        abi = Buffer.from(abiBuffer.asUint8Array()).toString('hex')

        folderToCleanup = tmpFolder
      }

      if (canDeploy) {
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

            ux.log(green(`WASM Successfully ${deployText}:`))
            ux.url('View TX', `${getExplorer()}/tx/${(res as any).transaction_id}?tab=traces`)
          } catch (error) {
            parseDetailsError(error)
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
            ux.log(green(`ABI Successfully ${deployText}:`))
            ux.url('View TX', `${getExplorer()}/tx/${(res as any).transaction_id}?tab=traces`)
          } catch (error) {
            parseDetailsError(error)
          }
        }

        // 5. Enable inline
        if (!flags.disableInline) {
          await ContractEnableInline.run([args.account])
        }
      }

      if (folderToCleanup) {
        rmSync(folderToCleanup, {recursive: true})
      }
    }
  }
}
