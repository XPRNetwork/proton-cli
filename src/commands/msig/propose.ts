/* eslint-disable no-console */
import { Command, flags } from '@oclif/command'
import { network } from '../../storage/networks'
import { CliUx } from '@oclif/core'
import { green, red } from 'colors'
import { getExplorer } from '../../apis/getExplorer'
import { Authorization } from '@proton/wrap-constants'
import { Serialize } from '@proton/js'

export default class MultisigPropose extends Command {
  static description = 'Multisig Propose'

  static args = [
    {name: 'proposalName', required: true, help: 'Name of proposal'},
    {name: 'actions', required: true, help: 'Actions JSON'},
    {name: 'auth', required: true, help: 'Your authorization'},
  ]

  static flags: { [k: string]: flags.IFlag<number>; } = {
    blocksBehind: flags.integer({char: 'b', default: 30}),
    expireSeconds: flags.integer({char: 'x', default: 60 * 60 * 24 * 7 }),
  }

  async run() {
    const {args: {proposalName, actions, auth}, flags} = this.parse(MultisigPropose)
    const [actor, permission] = auth.split('@')

    // Serialize inner actions using the contract ABIs
    const parsedActions = JSON.parse(actions)
    const serializedActions = await network.api.serializeActions(parsedActions)
    const transactionSettings = await network.protonApi.generateTransactionSettings(flags.expireSeconds, flags.blocksBehind, 0) as any

    // Find required signers
    let requested: Authorization[] = []
    for (const action of parsedActions) {
      for (const { actor, permission } of action.authorization) {
        const requiredAccountsLocal = await network.protonApi.getRequiredAccounts(actor, permission)
        requested = requested.concat(requiredAccountsLocal)
      }
    }
    requested = requested.filter((item, pos) => requested.findIndex(_ => _.actor === item.actor) === pos)

    // Manually serialize the inner transaction to avoid the library's
    // recursive re-serialization bug (it tries to re-parse already-serialized
    // action data as structured JSON, causing "Name should be less than 13
    // characters" errors for actions with u64/u128 fields).
    const trxBuf = new Serialize.SerialBuffer()

    // Transaction header
    const expDate = new Date(transactionSettings.expiration + 'Z')
    trxBuf.pushUint32(Math.floor(expDate.getTime() / 1000))
    trxBuf.pushUint16(transactionSettings.ref_block_num & 0xffff)
    trxBuf.pushUint32(transactionSettings.ref_block_prefix)
    trxBuf.pushVaruint32(0) // max_net_usage_words
    trxBuf.push(0)          // max_cpu_usage_ms
    trxBuf.pushVaruint32(0) // delay_sec

    // context_free_actions (empty)
    trxBuf.pushVaruint32(0)

    // actions
    trxBuf.pushVaruint32(serializedActions.length)
    for (const action of serializedActions) {
      trxBuf.pushName(action.account)
      trxBuf.pushName(action.name)

      // authorization
      trxBuf.pushVaruint32(action.authorization.length)
      for (const auth of action.authorization) {
        trxBuf.pushName(auth.actor)
        trxBuf.pushName(auth.permission)
      }

      // data (already serialized hex)
      const dataBytes = Buffer.from(action.data, 'hex')
      trxBuf.pushVaruint32(dataBytes.length)
      trxBuf.pushArray(dataBytes)
    }

    // transaction_extensions (empty)
    trxBuf.pushVaruint32(0)

    // Serialize the propose action data manually
    const proposeBuf = new Serialize.SerialBuffer()
    proposeBuf.pushName(actor)         // proposer
    proposeBuf.pushName(proposalName)  // proposal_name

    // requested (permission_level[])
    proposeBuf.pushVaruint32(requested.length)
    for (const req of requested) {
      proposeBuf.pushName(req.actor)
      proposeBuf.pushName(req.permission)
    }

    // trx (inline transaction struct, not length-prefixed)
    const trxBytes = trxBuf.asUint8Array()
    proposeBuf.pushArray(trxBytes)

    const proposeDataHex = Buffer.from(proposeBuf.asUint8Array()).toString('hex')

    try {
      // Pass pre-serialized hex data to avoid recursive serialization
      await network.transact({
        actions: [{
          account: 'eosio.msig',
          name: 'propose',
          data: proposeDataHex,
          authorization: [{ actor, permission: permission || 'active' }]
        }]
      })
      CliUx.ux.log(green(`Multisig ${proposalName} successfully proposed.`))
      CliUx.ux.url(`View Proposal`, `${getExplorer()}/msig/${actor}/${proposalName}`)
    } catch (err: any) {
      return this.error(red(err));
    }
  }
}
