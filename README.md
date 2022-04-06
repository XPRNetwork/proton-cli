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
$ npm install -g @proton/cli
$ proton COMMAND
running command...
$ proton (-v|--version|version)
@proton/cli/0.1.7 darwin-arm64 node-v16.14.0
$ proton --help [COMMAND]
USAGE
  $ proton COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`proton boilerplate [FOLDER]`](#proton-boilerplate-folder)
* [`proton generate:account`](#proton-generateaccount)
* [`proton help [COMMAND]`](#proton-help-command)
* [`proton keys:add [PRIVATEKEY]`](#proton-keysadd-privatekey)
* [`proton keys:generate`](#proton-keysgenerate)
* [`proton keys:list`](#proton-keyslist)
* [`proton keys:lock`](#proton-keyslock)
* [`proton keys:remove [PRIVATEKEY]`](#proton-keysremove-privatekey)
* [`proton keys:reset`](#proton-keysreset)
* [`proton keys:unlock [PASSWORD]`](#proton-keysunlock-password)
* [`proton multisig:contract DIRECTORY`](#proton-multisigcontract-directory)
* [`proton network:get`](#proton-networkget)
* [`proton network:list`](#proton-networklist)
* [`proton network:set CHAIN`](#proton-networkset-chain)
* [`proton set:contract ACCOUNT DIRECTORY`](#proton-setcontract-account-directory)
* [`proton system:dappreg ACCOUNT`](#proton-systemdappreg-account)
* [`proton system:newaccount ACCOUNT OWNER ACTIVE`](#proton-systemnewaccount-account-owner-active)
* [`proton version`](#proton-version)

## `proton boilerplate [FOLDER]`

Boilerplate a new Proton Project with contract, frontend and tests

```
USAGE
  $ proton boilerplate [FOLDER]

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/boilerplate.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.7/src/commands/boilerplate.ts)_

## `proton generate:account`

Generate Key

```
USAGE
  $ proton generate:account
```

_See code: [src/commands/generate/account.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.7/src/commands/generate/account.ts)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.3.1/src/commands/help.ts)_

## `proton keys:add [PRIVATEKEY]`

Add Key

```
USAGE
  $ proton keys:add [PRIVATEKEY]
```

_See code: [src/commands/keys/add.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.7/src/commands/keys/add.ts)_

## `proton keys:generate`

Generate Key

```
USAGE
  $ proton keys:generate
```

_See code: [src/commands/keys/generate.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.7/src/commands/keys/generate.ts)_

## `proton keys:list`

Generate Key

```
USAGE
  $ proton keys:list
```

_See code: [src/commands/keys/list.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.7/src/commands/keys/list.ts)_

## `proton keys:lock`

Lock Keys with password

```
USAGE
  $ proton keys:lock
```

_See code: [src/commands/keys/lock.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.7/src/commands/keys/lock.ts)_

## `proton keys:remove [PRIVATEKEY]`

Remove Key

```
USAGE
  $ proton keys:remove [PRIVATEKEY]
```

_See code: [src/commands/keys/remove.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.7/src/commands/keys/remove.ts)_

## `proton keys:reset`

Reset password (CAUTION: deletes all private keys stored)

```
USAGE
  $ proton keys:reset
```

_See code: [src/commands/keys/reset.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.7/src/commands/keys/reset.ts)_

## `proton keys:unlock [PASSWORD]`

Unlock Keys with password

```
USAGE
  $ proton keys:unlock [PASSWORD]
```

_See code: [src/commands/keys/unlock.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.7/src/commands/keys/unlock.ts)_

## `proton multisig:contract DIRECTORY`

Multisig Contract

```
USAGE
  $ proton multisig:contract DIRECTORY
```

_See code: [src/commands/multisig/contract.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.7/src/commands/multisig/contract.ts)_

## `proton network:get`

Get Current Network

```
USAGE
  $ proton network:get

ALIASES
  $ proton network
```

_See code: [src/commands/network/get.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.7/src/commands/network/get.ts)_

## `proton network:list`

All Networks

```
USAGE
  $ proton network:list
```

_See code: [src/commands/network/list.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.7/src/commands/network/list.ts)_

## `proton network:set CHAIN`

Set Network

```
USAGE
  $ proton network:set CHAIN
```

_See code: [src/commands/network/set.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.7/src/commands/network/set.ts)_

## `proton set:contract ACCOUNT DIRECTORY`

Set Contract

```
USAGE
  $ proton set:contract ACCOUNT DIRECTORY
```

_See code: [src/commands/set/contract.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.7/src/commands/set/contract.ts)_

## `proton system:dappreg ACCOUNT`

Set Contract

```
USAGE
  $ proton system:dappreg ACCOUNT
```

_See code: [src/commands/system/dappreg.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.7/src/commands/system/dappreg.ts)_

## `proton system:newaccount ACCOUNT OWNER ACTIVE`

System NewAccount

```
USAGE
  $ proton system:newaccount ACCOUNT OWNER ACTIVE

OPTIONS
  -c, --cpu=cpu   [default: 10.0000 SYS]
  -d, --dappreg
  -h, --help      show CLI help
  -n, --net=net   [default: 10.0000 SYS]
  -r, --ram=ram   [default: 12288]
  -t, --transfer
  --code
```

_See code: [src/commands/system/newaccount.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.7/src/commands/system/newaccount.ts)_

## `proton version`

Version of CLI

```
USAGE
  $ proton version
```

_See code: [src/commands/version.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.7/src/commands/version.ts)_
<!-- commandsstop -->
