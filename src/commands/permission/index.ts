import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { Key } from '@proton/js'
import { GetAccountResult } from '@proton/js/dist/rpc/types'
import { green, red } from 'colors'
import { Separator } from 'inquirer'
import { getLightAccount } from '../../apis/lightApi'
import { network } from '../../storage/networks'
import { parsePermissions } from '../../utils/permissions'
import { promptChoices, promptInteger, promptKey, promptAuthority, promptName } from '../../utils/prompt'
import { sortRequiredAuth } from '../../utils/sortRequiredAuth'
import { wait } from '../../utils/wait'

const parseKey = (key: { weight: number, key: string }) => `+${key.weight} | ${key.key}`
const parseAccount = (acc: { weight: number, permission: { actor: string, permission: string } }) => `A: | +${acc.weight} | ${acc.permission.actor}@${acc.permission.permission}`

export default class UpdatePermission extends Command {
  static description = 'Update Permission'

  static args = [
    {name: 'account', required: true, description: 'Account to modify'},
  ]

  async run() {
    const {args} = this.parse(UpdatePermission)

    // Track
    let account: GetAccountResult
    let lightAccount: any
    let permissionSnapshot
    let step
    let currentPermission: any

    const reset = async () => {
      // Sorts in-place and displays
      account = await network.rpc.get_account(args.account)
      lightAccount = await getLightAccount(args.account)
      await CliUx.ux.log('\n' + parsePermissions(account.permissions, lightAccount) + '\n')
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
      sortRequiredAuth(currentPermission.required_auth)

      await CliUx.ux.log(green('\n' + 'Expected Permissions:'))
      await CliUx.ux.log(parsePermissions(account!.permissions, lightAccount, false) + '\n')

      const authority = await CliUx.ux.prompt(green(`Enter signing permission`), { default: `${args.account}@active` })
      const [actor, permission] = authority.split('@')
      await network.transact({
        actions: [{
          account: 'eosio',
          name: 'updateauth',
          data: {
            account: args.account,
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

    const deleteCurrentPerm = async () => {
      const authority = await CliUx.ux.prompt(green(`Enter signing permission`), { default: `${args.account}@active` })
      const [actor, permission] = authority.split('@')

      const authorization = [{ actor, permission}]
      const removeLinksActions = lightAccount
        ? lightAccount.linkauth
            .filter((_: any) => _.requirement === currentPermission.perm_name)
            .map((_: any) => ({
              account: 'eosio',
              name: 'unlinkauth',
              data: {
                account: args.account,
                code: _.code,
                type: _.type
              },
              authorization
            }))
        : []

      const deleteActions = [
        {
          account: 'eosio',
          name: 'deleteauth',
          data: {
            account: args.account,
            permission: currentPermission.perm_name,
          },
          authorization: [{ actor, permission}]
        }
      ]

      await network.transact({
        actions: removeLinksActions.concat(deleteActions)
      })
      await CliUx.ux.log(`${green('Success:')} Permission deleted`)
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
            const permission = await promptName('permission')
            const parentpermission = await promptChoices('Choose parent permission:', account!.permissions.map(_ => _.perm_name), 'active')
            account!.permissions.push({
              perm_name: permission,
              parent: parentpermission,
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

        if (permissionSnapshot !== JSON.stringify(account!.permissions) && maxThreshold > 0) {
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
          const rawKey = authorization.split(' | ')[1]
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
          const [actor, permission] = authorization.split(' | ')[1].split('@')
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
          await deleteCurrentPerm()
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