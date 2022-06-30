import { Command, flags } from '@oclif/command'
import { network } from '../../storage/networks'
import { CliUx } from '@oclif/core'
import { config } from '../../storage/config';
import { green } from 'colors';
import { getExplorer } from '../../apis/getExplorer';

interface Permission {
  threshold: number;
  keys: {
    weight: number;
    key: string;
  }[];
  accounts: {
    weight: number;
    permission: {
      actor: string;
      permission:  string;
    };
  }[];
  waits: {
    weight: number;
    wait_sec: number;
  }[];
}

const parsePermission = (entry: string) => {
  const perm: Permission = {
    threshold: 1,
    keys: [],
    accounts: [],
    waits: [],
  }

  if (entry.indexOf('EOS') !== -1 || entry.indexOf('PUB_K1') !== -1) {
    perm.keys.push({key: entry, weight: 1})
  } else if (entry.indexOf('@') === -1) {
    perm.accounts.push({weight: 1, permission: {actor: entry, permission: 'active'}})
  } else {
    const [actor, permission] = entry.split('@')
    perm.accounts.push({weight: 1, permission: {actor, permission}})
  }

  return perm
}

const addCodeToPerm = (perm: Permission, actor: string) => {
  perm.accounts.push({weight: 1, permission: {actor, permission: 'eosio.code'}})
  return perm
}

export default class NewAccount extends Command {
  static description = 'System New Account'
  static hidden = true

  static flags = {
    help: flags.help({char: 'h'}),
    net: flags.string({char: 'n', default: '10.0000 SYS'}),
    cpu: flags.string({char: 'c', default: '10.0000 SYS'}),
    ram: flags.integer({char: 'r', default: 12288}),
    transfer: flags.boolean({char: 't', default: false}),
    code: flags.boolean({default: false}),
  }

  static args = [
    {name: 'account', required: true},
    {name: 'owner', required: true},
    {name: 'active', required: true},
  ]

  async run() {
    const {args, flags} = this.parse(NewAccount)

    // Ensure account does not exist
    try {
      await network.rpc.get_account(args.account)
      this.log(`Account ${args.account} already exists!`)
      await CliUx.ux.url('View Account on block explorer', `${getExplorer()}/account/${args.account}#keys`)
      return
    } catch (error) {
      // Do nothing
    }

    const actions = [
      {
        account: 'eosio',
        name: 'newaccount',
        authorization: [{
          actor: 'proton',
          permission: 'active',
        }],
        data: {
          creator: 'proton',
          name: args.account,
          owner: parsePermission(args.owner),
          active: parsePermission(args.active),
        },
      },
      {
        account: 'eosio',
        name: 'buyrambsys',
        authorization: [{
          actor: 'wlcm.proton',
          permission: 'newacc',
        }],
        data: {
          payer: 'wlcm.proton',
          receiver: args.account,
          bytes: flags.ram,
        },
      },
      {
        account: 'eosio',
        name: 'delegatebw',
        authorization: [{
          actor: 'wlcm.proton',
          permission: 'newacc',
        }],
        data: {
          from: 'wlcm.proton',
          receiver: args.account,
          stake_net_quantity: flags.net,
          stake_cpu_quantity: flags.cpu,
          transfer: flags.transfer,
        },
      },
    ]

    // Add eosio.code
    if (flags.code) {
      actions[0].data.active = addCodeToPerm(actions[0].data.active!, args.account)
    }

    // Execute
    await network.transact({ actions })

    this.log(`${green('Success:')} Account ${args.account} created!`)
    await CliUx.ux.url('View Account on block explorer', `${getExplorer()}/account/${args.account}#keys`)
  }
}
