import { expect } from 'chai'
import { runCli } from '../../helpers/cli'
import { isolatedHome, cleanupHome } from '../../helpers/fixtures'

describe('proton key:list', () => {
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

  it('reports no keys when the wallet is empty', async () => {
    const { stdout, code } = await runCli(['key:list'], { env })
    expect(code).to.equal(0)
    expect(stdout).to.match(/No keys saved/i)
  })

  it('does not print any private key strings in default output', async () => {
    const { stdout, stderr } = await runCli(['key:list'], { env })
    // Even when no keys exist, sanity-check the text never includes a real
    // PVT_K1_/PVT_R1_ prefix in the output.
    expect(stdout).to.not.match(/PVT_K1_|PVT_R1_/)
    expect(stderr).to.not.match(/PVT_K1_|PVT_R1_/)
  })

  it('responds to --help with a non-empty description', async () => {
    const { stdout, code } = await runCli(['key:list', '--help'], { env })
    expect(code).to.equal(0)
    expect(stdout).to.match(/reveal-private/i, 'help output should mention --reveal-private flag')
    expect(stdout).to.match(/force/i, 'help output should mention --force flag')
  })
})
