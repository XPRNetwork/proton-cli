import {Authorization} from '@proton/wrap-constants'

export type MultisigAction = {
  account: string;
  name: string;
  authorization: Authorization[];
  data: unknown;
};

// Code-unit order matches EOSIO name collation (`.` < `1-5` < `a-z`)
// and is stable across machines, unlike localeCompare.
export const compareNames = (left: string, right: string): number => {
  if (left === right) {
    return 0
  }

  return left < right ? -1 : 1
}

export const parseAuthorization = (value: string, argument = 'authorization'): Authorization => {
  const [actor, permission = 'active', ...extra] = value.split('@')

  if (!actor || !permission || extra.length > 0) {
    throw new Error(`${argument} must use the account@permission format`)
  }

  return {actor, permission}
}

export const authorizationKey = ({actor, permission}: Authorization): string => `${actor}@${permission}`

export const resolveRequestedApprovers = async (
  actions: MultisigAction[],
  getRequiredAccounts: (actor: string, permission: string) => Promise<Authorization[]>,
): Promise<Authorization[]> => {
  const requested = new Map<string, Authorization>()
  const actionAuthorizations = actions.flatMap(action => action.authorization)
  const requiredAccounts = await Promise.all(actionAuthorizations.map(async level => {
    const parsedLevel = parseAuthorization(`${level.actor}@${level.permission}`, 'action authorization')
    const required = await getRequiredAccounts(parsedLevel.actor, parsedLevel.permission)
    if (required.length === 0) {
      throw new Error(`could not resolve required accounts for ${authorizationKey(parsedLevel)}`)
    }

    return required
  }))
  for (const required of requiredAccounts.flat()) {
    requested.set(authorizationKey(required), required)
  }

  return [...requested.values()].sort((left, right) =>
    compareNames(left.actor, right.actor) || compareNames(left.permission, right.permission))
}

export const parseActions = (value: string): MultisigAction[] => {
  let actions: unknown

  try {
    actions = JSON.parse(value)
  } catch {
    throw new Error('actions must be valid JSON')
  }

  if (!Array.isArray(actions) || actions.length === 0) {
    throw new Error('actions must be a non-empty JSON array')
  }

  for (const action of actions) {
    if (!action || typeof action !== 'object') {
      throw new TypeError('each action must be an object')
    }

    const candidate = action as Record<string, unknown>
    if (typeof candidate.account !== 'string' || typeof candidate.name !== 'string' || !Array.isArray(candidate.authorization)) {
      throw new TypeError('each action must include account, name, and authorization')
    }

    if (candidate.authorization.some(authorization => {
      if (!authorization || typeof authorization !== 'object') {
        return true
      }

      const level = authorization as Record<string, unknown>
      return typeof level.actor !== 'string' || !level.actor || typeof level.permission !== 'string' || !level.permission
    })) {
      throw new TypeError('each authorization must include actor and permission')
    }

    if (!candidate.data || typeof candidate.data !== 'object' || Array.isArray(candidate.data)) {
      throw new TypeError('each action must include data')
    }
  }

  return actions as MultisigAction[]
}
