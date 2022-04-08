import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { Key } from '@proton/js'
import { GetAccountResult } from '@proton/js/dist/rpc/types'
import { green, red } from 'colors'
import { Separator } from 'inquirer'
import { network } from '../../storage/networks'
import { parsePermissions } from '../../utils/permissions'
import { promptChoices, promptInteger, promptKey, promptAuthority, promptName } from '../../utils/prompt'
import { wait } from '../../utils/wait'

const parseKey = (key: { weight: number, key: string }) => `🔑 | +${key.weight} | ${key.key}`
const parseAccount = (acc: { weight: number, permission: { actor: string, permission: string } }) => `👤 | +${acc.weight} | ${acc.permission.actor}@${acc.permission.permission}`

export default class UpdatePermission extends Command {
  static description = 'Add Key'

  static args = [
    {name: 'accountName', required: true, description: 'Account to modify'},
  ]

  async run() {
    const {args} = this.parse(UpdatePermission)

    // Track
    let account: GetAccountResult
    let permissionSnapshot
    let step
    let currentPermission: any

    const reset = async () => {
      // Sorts in-place and displays
      account = await network.rpc.get_account(args.accountName)
      await CliUx.ux.log('\n' + parsePermissions(account.permissions) + '\n')
      account.permissions.map(perm => {
        perm.required_auth.keys = perm.required_auth.keys.map(key => {
          key.key = Key.PublicKey.fromString(key.key).toString()
          return key
        })
        return perm
      })
      permissionSnapshot = JSON.stringify(account.permissions)

      // Reset
      step = 'selectPermission'
      currentPermission = undefined
    }
    await reset()

    // Save
    const save = async () => {
      currentPermission.required_auth.keys     = currentPermission.required_auth.keys.sort((a: { key: any; }, b: { key: any; }) => a.key.localeCompare(b.key))
      currentPermission.required_auth.accounts = currentPermission.required_auth.accounts.sort((a: { permission: { actor: any; }; }, b: { permission: { actor: any; }; }) => a.permission.actor.localeCompare(b.permission.actor))
      currentPermission.required_auth.waits    = currentPermission.required_auth.waits.sort((a: { wait_sec: any; }, b: { wait_sec: any; }) => a.wait_sec.localeCompare(b.wait_sec))

      await CliUx.ux.log(green('\n' + 'Expected Permissions:'))
      await CliUx.ux.log(parsePermissions(account!.permissions, false) + '\n')

      const authority = await CliUx.ux.prompt(green(`Please enter signing authority to update account (e.g. ${args.accountName}@owner)`))
      const [actor, permission] = authority.split('@')
      await network.transact({
        actions: [{
          account: 'eosio',
          name: 'updateauth',
          data: {
            account: args.accountName,
            permission: currentPermission.perm_name,
            parent: currentPermission.parent,
            auth: currentPermission.required_auth
          },
          authorization: [{ actor, permission}]
        }]
      })
      await CliUx.ux.log(`${green('Success:')} Permission updated`)
      step = 'displayPermission'
      await wait(1000)
    }

    while (true) {
      if (step === 'displayPermission') {
        await reset()
      }

      if (step === 'selectPermission') {
        const extraOptions = ['Add New Permission']
        if (permissionSnapshot !== JSON.stringify(account!.permissions)) {
          extraOptions.unshift(green('Save'))
        }
        
        const choices = account!.permissions.map(_ => _.perm_name)
                          .concat([new Separator() as any])
                          .concat(extraOptions)
      
        const permission = await promptChoices('Choose permission to edit:', choices)

        if (permission === green('Save')) {
          await save()
        } else {
          if (permission === 'Add New Permission') {
            const permissionName = await promptName('permission')
            const parentPermissionName = await promptChoices('Choose parent permission:', account!.permissions.map(_ => _.perm_name), 'active')
            account!.permissions.push({
              perm_name: permissionName,
              parent: parentPermissionName,
              required_auth: {
                threshold: 1,
                keys: [],
                accounts: [],
                waits: []
              }
            })
            currentPermission = account!.permissions[account!.permissions.length - 1]
          } else {
            currentPermission = account!.permissions.find(_ => _.perm_name === permission)
          }

          step = 'editPermission'
        }
      }

      if (step === 'editPermission' && currentPermission) {
        // Authorities
        const keys = currentPermission.required_auth.keys.map(parseKey);
        const accounts = currentPermission.required_auth.accounts.map(parseAccount);

        // Weights
        const totalKeysWeight = currentPermission.required_auth.keys.reduce((acc: any, key: any) => acc + key.weight, 0)
        const totalAccountsWeight = currentPermission.required_auth.accounts.reduce((acc: any, account: any) => acc + account.weight, 0)
        const maxThreshold = totalKeysWeight + totalAccountsWeight

        // Options
        const extraOptions = [
          'Add New Key',
          'Add New Account',
          'Go Back'
        ]

        if (!['owner', 'active'].includes(currentPermission.perm_name)) {
          extraOptions.splice(2, 0, `Delete Permission`)
        }

        if (maxThreshold > currentPermission.required_auth.threshold) {
          extraOptions.splice(2, 0, `Edit Threshold (Current: ${currentPermission.required_auth.threshold}, Max: ${maxThreshold})`)
        }

        if (permissionSnapshot !== JSON.stringify(account!.permissions)) {
          extraOptions.unshift(green('Save'))
        }

        const choices = keys.concat(accounts)
                            .concat([new Separator() as any])
                            .concat(extraOptions)
        let authorization = await promptChoices(
          `Choose permission ${currentPermission.perm_name}'s authorization to edit:`,
          choices,
          permissionSnapshot !== JSON.stringify(account!.permissions) ? green('Save') : undefined
        )

        if (authorization === 'Go Back')
        {
          step = 'selectPermission'
          currentPermission = undefined
          account!.permissions = JSON.parse(permissionSnapshot as any)
        }
        else if (authorization.indexOf('PUB_') !== -1)
        {
          const rawKey = authorization.split(' | ')[2]
          const selectedKeyIndex = currentPermission.required_auth.keys.findIndex((key: any) => key.key === rawKey)
          const selectedKey = currentPermission.required_auth.keys[selectedKeyIndex]

          let goBack = false
          while (!goBack) {
            const option = await promptChoices(`Choose an action for ${authorization}:`, ['Edit Weight', 'Edit Key', 'Delete Key', 'Go Back'])
            if (option === 'Edit Weight') {
              selectedKey!.weight = await promptInteger('key weight')
              authorization = parseKey(selectedKey)
            } else if (option === 'Edit Key') {
              selectedKey!.key = await promptKey()
              authorization = parseKey(selectedKey)
            } else if (option === 'Delete Key') {
              currentPermission.required_auth.keys.splice(selectedKeyIndex, 1)
              goBack = true
            } else if (option === 'Go Back') {
              goBack = true
            }
          }
        }
        else if (authorization.indexOf('@') !== -1)
        {
          const [actor, permission] = authorization.split(' | ')[2].split('@')
          const selectedAccountIndex = currentPermission.required_auth.accounts.findIndex((account: any) => account.permission.actor === actor && account.permission.permission === permission)
          const selectedAccount = currentPermission.required_auth.accounts[selectedAccountIndex]

          let goBack = false
          while (!goBack) {
            const choices = ['Edit Weight', 'Edit Account', 'Go Back']
            if (maxThreshold > currentPermission.required_auth.threshold) {
              choices.splice(2, 0, 'Delete Account')
            }

            const option = await promptChoices(`Choose an action for ${authorization}:`, choices)
            if (option === 'Edit Weight') {
              selectedAccount!.weight = await promptInteger('account weight')
              authorization = parseAccount(selectedAccount)
            } else if (option === 'Edit Account') {
              selectedAccount!.permission = await promptAuthority()
              authorization = parseAccount(selectedAccount)
            } else if (option === 'Delete Account') {
              currentPermission.required_auth.accounts.splice(selectedAccountIndex, 1)
              goBack = true
            } else if (option === 'Go Back') {
              goBack = true
            }
          }
        }
        else if (authorization === 'Delete Permission')
        {
          const permissionIndex = account!.permissions.findIndex(permission => permission.perm_name === currentPermission.perm_name)
          account!.permissions.splice(permissionIndex, 1)
          step = 'selectPermission'
        }
        else if (authorization.indexOf('Edit Threshold') !== -1)
        {
          currentPermission.required_auth.threshold = await promptInteger('threshold')
        }
        else if (authorization === 'Add New Key')
        {
          currentPermission.required_auth.keys.push({
            weight: await promptInteger('key weight'),
            key: await promptKey()
          })
        }
        else if (authorization === 'Add New Account')
        {
          currentPermission.required_auth.accounts.push({
            weight: await promptInteger('account weight'),
            permission: await promptAuthority()
          })
        }
        else if (authorization === green('Save'))
        {
          await save()
        }
      }
    }
  }

  async catch(e: Error) {
    CliUx.ux.error(red(e.message))
  }
}