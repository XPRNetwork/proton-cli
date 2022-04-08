import { Key } from '@proton/js';
import { prompt } from 'inquirer'
import { isPositiveInteger } from './integer';

export const promptInteger = async (text: string) => {
    const { weight } = await prompt<{ weight: number }>({
      name: 'weight',
      type: 'input',
      message: `Enter new ${text} (e.g. 1)`,
      filter: (w: string) => +w,
      validate: (w: any) => isPositiveInteger(String(w))
    });
    return weight
  }
  
export const promptAuthority = async () => {
  const {account} = await prompt<{ account: string }>({
    name: 'account',
    type: 'input',
    message: 'Enter new account authority (e.g. account@active)'
  });
  const [actor, permission] = account.split('@')
  return { actor, permission }
}

export const promptName = async (text: string) => {
  const {name} = await prompt<{ name: string }>({
    name: 'name',
    type: 'input',
    message: `Enter new ${text} name (e.g. account)`
  });
  return name
}
  
export const promptKey = async () => {
  const {key} = await prompt<{ key: string }>({
    name: 'key',
    type: 'input',
    message: 'Enter new key (e.g. PUB_K1...)',
    filter: (key: string) => Key.PublicKey.fromString(key).toString()
  });
  return key
}

export const promptChoices = async (message: string, choices: string[], def?: string) => {
  const { choice } = await prompt<{ choice: string }>([
    {
      name: 'choice',
      type: 'list',
      message: message,
      choices: choices,
      loop: false,
      pageSize: 10,
      default: def
    },
  ]);
  return choice
}