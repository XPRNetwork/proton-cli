import {Command, flags} from '@oclif/command'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/node'
import * as path from 'path'
import * as fs from 'fs'
import * as rimraf from 'rimraf'

const BOILERPLATE_URL = 'https://github.com/ProtonProtocol/proton-boilerplate.git'
const BOILERPLATE_BRANCH = 'master'

export default class Bootstrap extends Command {
  static description = 'Bootstrap a new Proton Project with contract, frontend and tests'

  static flags = {
    help: flags.help({char: 'h'}),
  }

  static args = [
    {name: 'folder'},
  ]

  async run() {
    const {args} = this.parse(Bootstrap)

    const name = args.folder ?? 'proton-boilerplate'
    const dir = path.join(process.cwd(), name)

    this.log(`Bootstrapping to ${name} folder`)
    await git.clone({
      fs,
      http,
      dir,
      url: BOILERPLATE_URL,
      ref: BOILERPLATE_BRANCH,
      singleBranch: true,
      depth: 1,
    })
    rimraf.sync(path.join(dir, '.git'))
  }
}
