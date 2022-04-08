import { Key } from "@proton/js"
import { green } from "colors"

export const parsePermissions = (permissions: any, sort: boolean = true) => {
    let text = ''
  
    if (sort) {
      permissions = permissions.sort(
        (a: any, b: any) => a.perm_name === 'owner' ? -2 : a.perm_name === 'active' ? -1 : 0
      )
    }
  
    let lastIndent = 0
    let lastParent = ''
    for (const permission of permissions) {
      if (lastParent !== permission.parent) {
        lastIndent += 2
        lastParent = permission.parent
      }
      if (lastParent !== '') {
        text += '\n\n'
      }
      text += '  '.repeat(lastIndent) + `${green(permission.perm_name)} (=${permission.required_auth.threshold}):    `
      text += permission.required_auth.keys.map((key: any) => '\n' + '  '.repeat(lastIndent) + ` 🔑 +${key.weight} ${Key.PublicKey.fromString(key.key).toString()}`).join('')
      text += permission.required_auth.accounts.map((account: any) => '\n' + '  '.repeat(lastIndent) + ` 👤 +${account.weight} ${account.permission.actor}@${account.permission.permission}`).join('')
    }
  
    return text
  }
