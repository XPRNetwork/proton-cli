import * as rimraf from 'rimraf'
import * as path from 'path'
import * as fs from 'fs'
import {expect, test} from '@oclif/test'

// const TEST_DIR_NAME = 'testdir'
// const TEST_DIR = path.join(process.cwd(), TEST_DIR_NAME)

const DEFAULT_DIR_NAME = 'proton-boilerplate'
const DEFAULT_DIR = path.join(process.cwd(), DEFAULT_DIR_NAME)

const folders = ['atom', 'c++_tests', 'frontend', 'js_tests']

const folderExists = (baseDir: string) => (folder: string) => fs.existsSync(path.join(baseDir, folder))

describe('bootstrap', () => {
  test
  .command(['bootstrap'])
  .finally(() => rimraf.sync(DEFAULT_DIR))
  .it('All folders exist', (_: any) => {
    const allExist = folders.every(folderExists(DEFAULT_DIR))
    expect(allExist).to.equal(true)
  })

  // test
  // .command(['bootstrap', TEST_DIR_NAME])
  // .finally(() => rimraf.sync(TEST_DIR))
  // .it('All folders exist', (_: any) => {
  //   const allExist = folders.every(folderExists(TEST_DIR))
  //   expect(allExist).to.equal(true)
  // })
})
