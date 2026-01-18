import { CliUx } from "@oclif/core"
import { red, yellow } from "colors"

// Map common blockchain errors to user-friendly messages
const ERROR_HINTS: Record<string, string> = {
  'insufficient ram': 'Try buying more RAM: proton ram:buy <account> <account> <bytes> -p <account>@active',
  'cpu usage exceeded': 'Your account has exceeded its CPU allocation. Wait for it to reset or stake more CPU.',
  'net usage exceeded': 'Your account has exceeded its NET allocation. Wait for it to reset or stake more NET.',
  'unknown key': 'The signing key is not available. Make sure you have added the correct private key: proton key:add',
  'transaction expired': 'The transaction took too long. Check your network connection and try again.',
  'insufficient balance': 'Your account does not have enough tokens for this transaction.',
  'missing authority': 'You do not have permission to perform this action. Check the authorization.',
  'duplicate transaction': 'This exact transaction was already executed. If intentional, wait a moment and retry.',
  'action blacklisted': 'This action is not allowed on this contract.',
  'account does not exist': 'The specified account does not exist on this chain.',
}

function getHint(errorMessage: string): string | null {
  const lowerError = errorMessage.toLowerCase()
  for (const [key, hint] of Object.entries(ERROR_HINTS)) {
    if (lowerError.includes(key)) {
      return hint
    }
  }
  return null
}

export const parseDetailsError = (e: Error | any) => {
  const error = e && e.details && e.details.length && e.details[0] && e.details[0].message
  const message = error || e?.message || ''

  if (message || typeof e === 'object') {
    CliUx.ux.log('\n' + red('Error: ' + message))

    // Check for helpful hints
    const hint = getHint(message)
    if (hint) {
      CliUx.ux.log(yellow('Hint: ' + hint))
    }
  } else {
    CliUx.ux.styledJSON(e)
  }
}
