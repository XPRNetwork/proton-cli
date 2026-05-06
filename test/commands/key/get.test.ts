import { expect } from 'chai'
import { runCli } from '../../helpers/cli'
import { isolatedHome, cleanupHome } from '../../helpers/fixtures'

describe('proton key:get', () => {
  let homeDir: string
  let env: Record<string, string>

  beforeEach(() => {
    const isolated = isolatedHome()
    homeDir = isolated.dir
    env = isolated.env
  })

  afterEach(() => {
    cleanupHome(homeDir)
  })

  it('reports no matching key when wallet is empty', async () => {
    const fakePub = 'PUB_K1_6wbMHNRQPNKYHBPzxiNC54xc8gWtHfed967wYuV16wvpCpcMZx'
    const { stdout, code } = await runCli(['key:get', fakePub], { env })
    expect(code).to.equal(0)
    expect(stdout).to.match(/no matching private key/i)
  })

  it('responds to --help with details about reveal password and --force', async () => {
    const { stdout, code } = await runCli(['key:get', '--help'], { env })
    expect(code).to.equal(0)
    expect(stdout).to.match(/reveal password/i)
    expect(stdout).to.match(/force/i)
  })

  it('does not leak private key strings in --help output', async () => {
    const { stdout, stderr } = await runCli(['key:get', '--help'], { env })
    expect(stdout).to.not.match(/PVT_K1_/)
    expect(stderr).to.not.match(/PVT_K1_/)
  })
})
