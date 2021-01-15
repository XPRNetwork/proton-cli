import {Command} from '@oclif/command'
import * as os from 'os'
import * as fs from 'fs'
import * as ini from 'ini'
import {execSync} from 'child_process'
import {ux} from 'cli-ux'
import {error} from '../debug'

const {sync} = require('hasbin')

export default class Install extends Command {
  static description = 'Install nodeos, cleos and keosd software'

  static args = [
    {name: 'version', description: 'EOSIO version', default: '2.1.0-rc1'},
  ]

  async run() {
    const type = os.type()
    const {args} = this.parse(Install)

    if (type === 'Darwin') {
      if (sync('brew')) {
        this.log('Brew Package Manager Found!')
      } else {
        this.log('Installing Brew Package Manager')
        execSync('/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"')
        if (!sync('brew')) {
          throw new Error('Brew Installation failed')
        }
      }

      this.log('Tapping brew package')
      execSync('brew tap eosio/eosio')

      this.log('Installing brew package')
      execSync('brew install eosio')
    } else if (type === 'Linux') {
      const releaseConfig = ini.parse(fs.readFileSync('/etc/lsb-release', 'utf8'))
      if (!releaseConfig || !releaseConfig.DISTRIB_ID || !releaseConfig.DISTRIB_RELEASE) {
        throw new Error('Unsupported Linux Version')
      }

      if (releaseConfig.DISTRIB_ID === 'Ubuntu') {
        if (!['16.04', '18.04'].includes(releaseConfig.DISTRIB_RELEASE)) {
          throw new Error('Only Ubuntu 16.04 and 18.04 are supported')
        }

        this.log('Fetching package...')
        execSync(`wget https://github.com/eosio/eos/releases/download/v${args.version}/eosio_${args.version}-ubuntu-${releaseConfig.DISTRIB_RELEASE}_amd64.deb`)

        this.log('Installing package...')
        execSync(`sudo apt install ./eosio_${args.version}-ubuntu-${releaseConfig.DISTRIB_RELEASE}_amd64.deb`)
      } else if (sync('rpm')) {
        this.log('Fetching package...')
        execSync(`wget https://github.com/eosio/eos/releases/download/v${args.version}/eosio-${args.version}.el7.x86_64.rpm`)

        this.log('Installing package...')
        execSync(`sudo yum install ./eosio-${args.version}.el7.x86_64.rpm`)
      } else {
        throw new Error('Unsupported Linux Version')
      }
    } else {
      throw new Error('Not supported outside of MacOS or Linux. If using Windows, follow this guide to install Ubuntu under WSL: https://docs.microsoft.com/en-us/windows/wsl/install-win10#manual-installation-steps')
    }
  }

  async catch(e: Error) {
    error(e)
    ux.styledJSON(e)
  }
}
