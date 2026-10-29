import {strict as assert} from 'node:assert'
import {cleanupHome, isolatedHome, runCli} from '../helpers/cli'

const PRIVATE_KEY_PATTERN = /PVT_K1_|PVT_R1_/
const UNKNOWN_PUBLIC_KEY = 'PUB_K1_6wbMHNRQPNKYHBPzxiNC54xc8gWtHfed967wYuV16wvpCpcMZx'

describe('key commands', function () {
  // Each case spawns the CLI through ts-node
  this.timeout(60_000)

  let home: {dir: string; env: Record<string, string>}

  beforeEach(() => {
    home = isolatedHome()
  })

  afterEach(() => {
    cleanupHome(home.dir)
  })

  describe('key:list', () => {
    it('reports no keys when the wallet is empty', async () => {
      const {stdout, code} = await runCli(['key:list'], {env: home.env})
      assert.equal(code, 0)
      assert.match(stdout, /no keys saved/i)
    })

    it('never prints private key strings', async () => {
      const {stdout, stderr} = await runCli(['key:list'], {env: home.env})
      assert.doesNotMatch(stdout, PRIVATE_KEY_PATTERN)
      assert.doesNotMatch(stderr, PRIVATE_KEY_PATTERN)
    })

    it('documents --reveal-private and --force in help', async () => {
      const {stdout, code} = await runCli(['key:list', '--help'], {env: home.env})
      assert.equal(code, 0)
      assert.match(stdout, /reveal-private/i)
      assert.match(stdout, /force/i)
    })
  })

  describe('key:get', () => {
    it('reports no matching key when the wallet is empty', async () => {
      const {stdout, code} = await runCli(['key:get', UNKNOWN_PUBLIC_KEY], {env: home.env})
      assert.equal(code, 0)
      assert.match(stdout, /no matching private key/i)
    })

    it('documents the reveal password and --force in help without leaking keys', async () => {
      const {stdout, stderr, code} = await runCli(['key:get', '--help'], {env: home.env})
      assert.equal(code, 0)
      assert.match(stdout, /reveal password/i)
      assert.match(stdout, /force/i)
      assert.doesNotMatch(stdout, PRIVATE_KEY_PATTERN)
      assert.doesNotMatch(stderr, PRIVATE_KEY_PATTERN)
    })
  })

  describe('key:reveal-setup / key:reveal-disable', () => {
    it('reveal-setup refuses to run without an interactive terminal', async () => {
      const {stderr, code} = await runCli(['key:reveal-setup'], {env: home.env, input: 'something\nsomething\n'})
      assert.notEqual(code, 0)
      assert.match(stderr, /interactive terminal/i)
    })

    it('reveal-disable is a no-op on a fresh wallet', async () => {
      const {stdout, code} = await runCli(['key:reveal-disable'], {env: home.env})
      assert.equal(code, 0)
      assert.match(stdout, /no reveal password/i)
    })

    it('describes the reveal password in help for both commands', async () => {
      const setup = await runCli(['key:reveal-setup', '--help'], {env: home.env})
      assert.equal(setup.code, 0)
      assert.match(setup.stdout, /reveal password/i)

      const disable = await runCli(['key:reveal-disable', '--help'], {env: home.env})
      assert.equal(disable.code, 0)
      assert.match(disable.stdout, /reveal password/i)
      assert.match(disable.stdout, /remove|disable/i)
    })
  })
})
