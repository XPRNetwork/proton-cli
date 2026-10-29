import { Command, Args } from '@oclif/core'
import { ux } from '../utils/ux'

import git from 'isomorphic-git'
import http from 'isomorphic-git/http/node'
import * as path from 'path'
import * as fs from 'fs'
import * as rimraf from 'rimraf'

const BOILERPLATE_URL = 'https://github.com/ProtonProtocol/proton-boilerplate.git'
const BOILERPLATE_BRANCH = 'master'

export default class Boilerplate extends Command {
  static description = 'Boilerplate a new Proton Project with contract, frontend and tests'

  static flags = {
}

  static args = {
    folder: Args.string({}),
  }

  async run() {
    const {args} = await this.parse(Boilerplate)

    const name = args.folder ?? 'proton-boilerplate'
    const dir = path.join(process.cwd(), name)

    this.log(`Boilerplateping to ${name} folder`)
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

  async catch(e: Error) {
    ux.styledJSON(e)
  }
}
