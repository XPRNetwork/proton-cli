@protonprotocol/cli
===================

Proton CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@protonprotocol/cli.svg)](https://npmjs.org/package/@protonprotocol/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@protonprotocol/cli.svg)](https://npmjs.org/package/@protonprotocol/cli)
[![License](https://img.shields.io/npm/l/@protonprotocol/cli.svg)](https://github.com/ProtonProtocol/proton-cli/blob/master/package.json)

<!-- toc -->
* [Installation](#installation)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Installation
From Scratch
```
curl -Ls https://raw.githubusercontent.com/ProtonProtocol/proton-cli/master/install.sh | sh
```

NPM
```
npm i -g @protonprotocol/cli
```

yarn
```
yarn global add @protonprotocol/cli
```
# Usage
<!-- usage -->
```sh-session
$ npm install -g @protonprotocol/cli
$ proton COMMAND
running command...
$ proton (-v|--version|version)
@protonprotocol/cli/0.3.9 darwin-x64 node-v12.19.0
$ proton --help [COMMAND]
USAGE
  $ proton COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`proton boilerplate [FOLDER]`](#proton-boilerplate-folder)
* [`proton help [COMMAND]`](#proton-help-command)
* [`proton install [VERSION]`](#proton-install-version)
* [`proton version`](#proton-version)
* [`proton wallet [FILE]`](#proton-wallet-file)

## `proton boilerplate [FOLDER]`

Boilerplate a new Proton Project with contract, frontend and tests

```
USAGE
  $ proton boilerplate [FOLDER]

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/boilerplate.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.3.9/src/commands/boilerplate.ts)_

## `proton help [COMMAND]`

display help for proton

```
USAGE
  $ proton help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.1/src/commands/help.ts)_

## `proton install [VERSION]`

Install nodeos, cleos and keosd software

```
USAGE
  $ proton install [VERSION]

ARGUMENTS
  VERSION  [default: 2.1.0-rc1] EOSIO version
```

_See code: [src/commands/install.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.3.9/src/commands/install.ts)_

## `proton version`

Version of CLI

```
USAGE
  $ proton version
```

_See code: [src/commands/version.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.3.9/src/commands/version.ts)_

## `proton wallet [FILE]`

describe the command here

```
USAGE
  $ proton wallet [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/wallet/index.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.3.9/src/commands/wallet/index.ts)_
<!-- commandsstop -->
