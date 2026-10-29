import {Config} from '@oclif/core'
import {fancy} from 'fancy-test'
import * as path from 'node:path'

export {expect} from 'chai'

// @oclif/test@1 was fancy-test plus a `.command()` plugin; @oclif/test@4 drops that
// chainable API, so this re-creates `.command()` on top of @oclif/core v4.

// oclif v4 only maps lib/ back to src/ (via ts-node) outside production
process.env.NODE_ENV = process.env.NODE_ENV ?? 'test'

let config: Config | undefined

const command = (args: string[] | string) => ({
  async run() {
    config = config ?? await Config.load({root: path.resolve(__dirname, '..', '..')})
    const [id, ...argv] = typeof args === 'string' ? [args] : args
    await config.runCommand(id, argv)
  },
})

export const test = fancy.register('command', command)
