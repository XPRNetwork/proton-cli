import {expect, test} from '@oclif/test'

const packageJson = require('../../package.json')

describe('version', () => {
  test
  .stdout()
  .command(['version'])
  .it('matches current version', ctx => {
    expect(ctx.stdout.replace('\n', '')).to.equal(packageJson.version)
  })
})
