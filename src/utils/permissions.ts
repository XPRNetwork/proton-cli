import { Key } from "@proton/js"
import { green, underline } from "colors"

export const parsePermissions = (permissions: any, lightAccount: any, sort: boolean = true) => {
  // Links
  const links = lightAccount
    ? lightAccount.linkauth.map((auth: any) => ({
      action: auth.type,
      contract: auth.code,
      perm_name: auth.requirement
    }))
    : []

  // Print
  let text = ''

  if (sort) {
    permissions = permissions.sort(
      (a: any, b: any) => a.perm_name === 'owner' ? -2 : a.perm_name === 'active' ? -1 : 0
    )
  }

  let lastIndent = 0
  let lastParent = ''
  for (const permission of permissions) {
    const permissionLinks = links.filter((_: any) => _.perm_name === permission.perm_name)

    if (lastParent !== permission.parent) {
      lastIndent += 2
      lastParent = permission.parent
    }
    if (lastParent !== '') {
      text += '\n\n'
    }
    text += '  '.repeat(lastIndent) + `${green(permission.perm_name)} (=${permission.required_auth.threshold}):    `
    text += permission.required_auth.keys.map((key: any) => '\n' + '  '.repeat(lastIndent) + ` +${key.weight} ${Key.PublicKey.fromString(key.key).toString()}`).join('')
    text += permission.required_auth.accounts.map((account: any) => '\n' + '  '.repeat(lastIndent) + ` +${account.weight} ${account.permission.actor}@${account.permission.permission}`).join('')
    
    if (permissionLinks.length) {
      text += '\n\n' + '  '.repeat(lastIndent) + ` ` + underline(`Links:`)
      text += permissionLinks.map((_: any) => '\n' + '  '.repeat(lastIndent) + ` ${_.contract || '*'}@${_.action || '*'}`).join('')
    }
  }

  return text
}
