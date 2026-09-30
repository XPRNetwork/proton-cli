import {Authorization} from '@proton/wrap-constants'

export type MultisigAction = {
  account: string;
  name: string;
  authorization: Authorization[];
  data: unknown;
};

export const parseAuthorization = (value: string, argument = 'authorization'): Authorization => {
  const [actor, permission = 'active', ...extra] = value.split('@')

  if (!actor || !permission || extra.length > 0) {
    throw new Error(`${argument} must use the account@permission format`)
  }

  return {actor, permission}
}

export const authorizationKey = ({actor, permission}: Authorization): string => `${actor}@${permission}`

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
  }

  return actions as MultisigAction[]
}
