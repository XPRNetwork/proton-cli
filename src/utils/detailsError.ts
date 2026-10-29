import { ux } from './ux'

import { red, yellow } from "colors"

// Common error patterns and helpful hints
const ERROR_HINTS: { pattern: RegExp | string; hint: string }[] = [
  {
    pattern: /insufficient ram/i,
    hint: 'Try buying more RAM: proton ram:buy <account> <account> <bytes>'
  },
  {
    pattern: /tx_cpu_usage_exceeded|billed CPU time/i,
    hint: 'CPU limit exceeded. Wait a few minutes for your CPU to reset, or stake more XPR for resources.'
  },
  {
    pattern: /tx_net_usage_exceeded/i,
    hint: 'NET limit exceeded. Wait a few minutes for your NET to reset, or stake more XPR for resources.'
  },
  {
    pattern: /unknown key/i,
    hint: 'The signing key is not available. Make sure you have added the correct private key: proton key:add'
  },
  {
    pattern: /overdrawn balance|insufficient funds/i,
    hint: 'Insufficient token balance for this transaction.'
  },
  {
    pattern: /missing authority|missing required authority/i,
    hint: 'You don\'t have permission to perform this action. Check the account and permission.'
  },
  {
    pattern: /deadline exceeded/i,
    hint: 'Transaction timed out. The network may be congested, try again.'
  },
  {
    pattern: /duplicate transaction/i,
    hint: 'This exact transaction was already submitted. Wait a moment before retrying.'
  },
  {
    pattern: /account does not exist/i,
    hint: 'The specified account doesn\'t exist on this network.'
  },
]

const getHintForError = (errorMessage: string): string | null => {
  for (const { pattern, hint } of ERROR_HINTS) {
    if (typeof pattern === 'string') {
      if (errorMessage.toLowerCase().includes(pattern.toLowerCase())) {
        return hint
      }
    } else if (pattern.test(errorMessage)) {
      return hint
    }
  }
  return null
}

export const parseDetailsError = (e: Error | any) => {
  const error = e && e.details && e.details.length && e.details[0] && e.details[0].message
  const errorMessage = error || e?.message || ''

  if (errorMessage || typeof e === 'object') {
    ux.log('\n' + red(errorMessage || JSON.stringify(e)))

    // Check for helpful hints
    const hint = getHintForError(errorMessage)
    if (hint) {
      ux.log(yellow('Hint: ') + hint)
    }
  } else {
    ux.styledJSON(e)
  }
}
