import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { green, red, yellow } from 'colors'
import passwordManager from '../../storage/passwordManager'
import { isRevealPasswordSet, requireRevealPassword } from '../../storage/revealPassword'

const CONFIRMATION_PHRASE = 'I UNDERSTAND'

export default class GetPrivateKey extends Command {
  static description = 'Reveal the private key for a saved public key (gated by the reveal password if one is set)'

  static args = [
    { name: 'publicKey', required: true },
  ]

  async run() {
    const { args } = this.parse(GetPrivateKey)

    const privateKey = await passwordManager.getPrivateKey(args.publicKey)
    if (!privateKey) {
      CliUx.ux.log(`${red('Failure:')} No matching private key found in saved keys`)
      return
    }

    if (!process.stdout.isTTY || !process.stdin.isTTY) {
      CliUx.ux.error('Refusing to print a private key to a non-TTY stream. Run this in an interactive terminal.')
    }

    if (isRevealPasswordSet()) {
      await requireRevealPassword()
    } else {
      CliUx.ux.log(yellow('No reveal password is set. Run `proton key:reveal-setup` to protect private-key reveals behind a password that AI agents running on this machine cannot bypass.'))
      CliUx.ux.log(red('WARNING: This will print a PRIVATE KEY to the terminal.'))
      CliUx.ux.log(red('Anyone with this key can control the associated account. Make sure no one is watching and your terminal is not being recorded.'))
      const confirmation = await CliUx.ux.prompt(`Type "${CONFIRMATION_PHRASE}" to continue`)
      if (confirmation !== CONFIRMATION_PHRASE) {
        CliUx.ux.error('Confirmation phrase did not match. Aborting.')
      }
    }

    CliUx.ux.log(`${green('Success:')} ${privateKey}`)
  }
}
