import * as fs from 'fs'
import * as path from 'path'

export const settings = {
  path: path.join(process.cwd(), 'settings.json'),

  get: () => JSON.parse(fs.readFileSync(settings.path) as any as string),
  set: (setting: object) => fs.writeFileSync(settings.path, JSON.stringify(setting, null, 4)),
  merge: (obj: object) => settings.set({...settings.get(), ...obj}),
  exists: () => fs.existsSync(settings.path),
  delete: () => settings.exists() && fs.unlinkSync(settings.path),
}

export const networks = [
  {chain: 'proton', endpoints: ['https://proton.greymass.com']},
  {chain: 'proton-test', endpoints: ['https://protontestnet.greymass.com']},
  {chain: 'eos', endpoints: ['https://eos.greymass.com']},
]
