import {Command, flags} from '@oclif/command'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/node'
import * as path from 'path'
import * as fs from 'fs'

export default class Bootstrap extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({char: 'h'}),
    name: flags.string({char: 'n', description: 'name of folder to copy boilerplate to'}),
  }

  static args = [
    {name: 'folder'},
  ]

  async run() {
    const {args} = this.parse(Bootstrap)

    const name = args.folder ?? 'proton-boilerplate'
    const dir = path.join(process.cwd(), name)

    this.log(`Bootstrapping to ${name} folder`)
    git.clone({
      fs,
      http,
      dir,
      url: 'https://github.com/jafri/proton-boilerplate',
    })
  }
}
