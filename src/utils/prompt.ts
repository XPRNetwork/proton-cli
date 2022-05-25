import { Key } from '@proton/js';
import { prompt } from 'inquirer'
import AddPrivateKey from '../commands/key/add';
import GenerateKey from '../commands/key/generate';
import { isPositiveInteger } from './integer';

export const promptInteger = async (text: string) => {
  const { weight } = await prompt<{ weight: number }>({
    name: 'weight',
    type: 'input',
    message: `Enter new ${text}:`,
    default: 1,
    filter: (w: string) => +w,
    validate: (w: any) => isPositiveInteger(String(w))
  });
  return weight
}

export const promptAuthority = async (text = 'account authority (e.g. account@active)') => {
  const { account } = await prompt<{ account: string }>({
    name: 'account',
    type: 'input',
    message: `Enter new ${text}`
  });
  const [actor, permission] = account.split('@')
  return { actor, permission }
}

export const promptName = async (text: string,
  opts: {
    default?: string,
    validate?: (input: string) => boolean | string | Promise<boolean | string>,
  } = {}
) => {
  if (!opts.validate) {
    opts.validate = (input) => true;
  }
  const { name } = await prompt<{ name: string; }>({
    name: 'name',
    type: 'input',
    message: `Enter new ${text} name:`,
    default: opts.default,
    validate: opts.validate
  });
  return name;
}

export const promptKey = async () => {
  let { publicKey } = await prompt<{ publicKey: string | undefined }>({
    name: 'key',
    type: 'input',
    message: 'Enter new public key (e.g. PUB_K1..., leave empty to create new):',
  });

  if (!publicKey) {
    const privateKey = await GenerateKey.run()
    await AddPrivateKey.run([privateKey])
    publicKey = Key.PrivateKey.fromString(privateKey).getPublicKey().toString()
  }

  return Key.PublicKey.fromString(publicKey).toString()
}

export const promptChoices = async (message: string, choices: string[], def?: string) => {
  const { choice } = await prompt<{ choice: string }>([
    {
      name: 'choice',
      type: 'list',
      message: message,
      choices: choices,
      loop: false,
      pageSize: 20,
      default: def
    },
  ]);
  return choice
}
