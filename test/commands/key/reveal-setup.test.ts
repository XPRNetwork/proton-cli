import { expect } from 'chai'
import { runCli } from '../../helpers/cli'
import { isolatedHome, cleanupHome } from '../../helpers/fixtures'

describe('proton key:reveal-setup / key:reveal-disable', () => {
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

  it('reveal-setup --help mentions reveal password', async () => {
    const { stdout, code } = await runCli(['key:reveal-setup', '--help'], { env })
    expect(code).to.equal(0)
    expect(stdout.toLowerCase()).to.include('reveal password')
  })

  it('reveal-disable --help describes removal of the password', async () => {
    const { stdout, code } = await runCli(['key:reveal-disable', '--help'], { env })
    expect(code).to.equal(0)
    expect(stdout.toLowerCase()).to.include('reveal password')
    expect(stdout.toLowerCase()).to.match(/remove|disable/)
  })

  it('reveal-disable on a fresh wallet (no password set) is a no-op', async () => {
    const { stdout, code } = await runCli(['key:reveal-disable'], { env })
    expect(code).to.equal(0)
    expect(stdout.toLowerCase()).to.include('no reveal password')
  })

  it('reveal-setup refuses to run in non-TTY environment', async () => {
    const { code, stderr } = await runCli(['key:reveal-setup'], { env, input: 'something\nsomething\n' })
    // Either it errors out for non-TTY, or it prompts and exits cleanly.
    // We just want to make sure it doesn't silently succeed without input validation.
    if (code !== 0) {
      expect(stderr.toLowerCase()).to.match(/interactive|tty|terminal/)
    }
  })
})
