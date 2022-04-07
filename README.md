@proton/cli
===================

Proton CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@proton/cli.svg)](https://npmjs.org/package/@proton/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@proton/cli.svg)](https://npmjs.org/package/@proton/cli)
[![License](https://img.shields.io/npm/l/@proton/cli.svg)](https://github.com/ProtonProtocol/proton-cli/blob/master/package.json)

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
npm i -g @proton/cli
```

yarn
```
yarn global add @proton/cli
```
# Usage
<!-- usage -->
```sh-session
$ npm install -g @proton/cli
$ proton COMMAND
running command...
$ proton (--version)
@proton/cli/0.1.12 darwin-arm64 node-v16.14.0
$ proton --help [COMMAND]
USAGE
  $ proton COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`proton account ACCOUNTNAME`](#proton-account-accountname)
* [`proton boilerplate [FOLDER]`](#proton-boilerplate-folder)
* [`proton chain`](#proton-chain)
* [`proton chain:info`](#proton-chaininfo)
* [`proton chain:list`](#proton-chainlist)
* [`proton chain:set`](#proton-chainset)
* [`proton contract:contract ACCOUNT DIRECTORY`](#proton-contractcontract-account-directory)
* [`proton help [COMMAND]`](#proton-help-command)
* [`proton keys:add [PRIVATEKEY]`](#proton-keysadd-privatekey)
* [`proton keys:generate`](#proton-keysgenerate)
* [`proton keys:list`](#proton-keyslist)
* [`proton keys:lock`](#proton-keyslock)
* [`proton keys:remove [PRIVATEKEY]`](#proton-keysremove-privatekey)
* [`proton keys:reset`](#proton-keysreset)
* [`proton keys:unlock [PASSWORD]`](#proton-keysunlock-password)
* [`proton multisig:contract DIRECTORY`](#proton-multisigcontract-directory)
* [`proton network`](#proton-network)
* [`proton system:newaccount ACCOUNT OWNER ACTIVE`](#proton-systemnewaccount-account-owner-active)
* [`proton version`](#proton-version)

## `proton account ACCOUNTNAME`

Get Account Information

```
USAGE
  $ proton account [ACCOUNTNAME] [-r]

FLAGS
  -r, --raw

DESCRIPTION
  Get Account Information
```

_See code: [src/commands/account/index.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.12/src/commands/account/index.ts)_

## `proton boilerplate [FOLDER]`

Boilerplate a new Proton Project with contract, frontend and tests

```
USAGE
  $ proton boilerplate [FOLDER] [-h]

FLAGS
  -h, --help  show CLI help

DESCRIPTION
  Boilerplate a new Proton Project with contract, frontend and tests
```

_See code: [src/commands/boilerplate.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.12/src/commands/boilerplate.ts)_

## `proton chain`

Get Current Chain

```
USAGE
  $ proton chain

DESCRIPTION
  Get Current Chain

ALIASES
  $ proton network
```

_See code: [src/commands/chain/index.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.12/src/commands/chain/index.ts)_

## `proton chain:info`

Get Chain Info

```
USAGE
  $ proton chain:info

DESCRIPTION
  Get Chain Info
```

_See code: [src/commands/chain/info.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.12/src/commands/chain/info.ts)_

## `proton chain:list`

All Networks

```
USAGE
  $ proton chain:list

DESCRIPTION
  All Networks
```

_See code: [src/commands/chain/list.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.12/src/commands/chain/list.ts)_

## `proton chain:set`

Set Chain

```
USAGE
  $ proton chain:set [--chain proton|proton-test]

FLAGS
  --chain=<option>  <options: proton|proton-test>

DESCRIPTION
  Set Chain
```

_See code: [src/commands/chain/set.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.12/src/commands/chain/set.ts)_

## `proton contract:contract ACCOUNT DIRECTORY`

Set Contract

```
USAGE
  $ proton contract:contract [ACCOUNT] [DIRECTORY]

DESCRIPTION
  Set Contract
```

_See code: [src/commands/contract/contract.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.12/src/commands/contract/contract.ts)_

## `proton help [COMMAND]`

display help for proton

```
USAGE
  $ proton help [COMMAND] [--all]

ARGUMENTS
  COMMAND  command to show help for

FLAGS
  --all  see all commands in CLI

DESCRIPTION
  display help for proton
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.3.1/src/commands/help.ts)_

## `proton keys:add [PRIVATEKEY]`

Add Key

```
USAGE
  $ proton keys:add [PRIVATEKEY]

DESCRIPTION
  Add Key
```

_See code: [src/commands/keys/add.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.12/src/commands/keys/add.ts)_

## `proton keys:generate`

Generate Key

```
USAGE
  $ proton keys:generate

DESCRIPTION
  Generate Key
```

_See code: [src/commands/keys/generate.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.12/src/commands/keys/generate.ts)_

## `proton keys:list`

List All Key

```
USAGE
  $ proton keys:list

DESCRIPTION
  List All Key
```

_See code: [src/commands/keys/list.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.12/src/commands/keys/list.ts)_

## `proton keys:lock`

Lock Keys with password

```
USAGE
  $ proton keys:lock

DESCRIPTION
  Lock Keys with password
```

_See code: [src/commands/keys/lock.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.12/src/commands/keys/lock.ts)_

## `proton keys:remove [PRIVATEKEY]`

Remove Key

```
USAGE
  $ proton keys:remove [PRIVATEKEY]

DESCRIPTION
  Remove Key
```

_See code: [src/commands/keys/remove.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.12/src/commands/keys/remove.ts)_

## `proton keys:reset`

Reset password (Caution: deletes all private keys stored)

```
USAGE
  $ proton keys:reset

DESCRIPTION
  Reset password (Caution: deletes all private keys stored)
```

_See code: [src/commands/keys/reset.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.12/src/commands/keys/reset.ts)_

## `proton keys:unlock [PASSWORD]`

Unlock all keys (Caution: Your keys will be stored in plaintext on disk)

```
USAGE
  $ proton keys:unlock [PASSWORD]

DESCRIPTION
  Unlock all keys (Caution: Your keys will be stored in plaintext on disk)
```

_See code: [src/commands/keys/unlock.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.12/src/commands/keys/unlock.ts)_

## `proton multisig:contract DIRECTORY`

Multisig Contract

```
USAGE
  $ proton multisig:contract [DIRECTORY]

DESCRIPTION
  Multisig Contract
```

_See code: [src/commands/multisig/contract.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.12/src/commands/multisig/contract.ts)_

## `proton network`

Get Current Chain

```
USAGE
  $ proton network

DESCRIPTION
  Get Current Chain

ALIASES
  $ proton network
```

## `proton system:newaccount ACCOUNT OWNER ACTIVE`

System NewAccount

```
USAGE
  $ proton system:newaccount [ACCOUNT] [OWNER] [ACTIVE] [-h] [-n <value>] [-c <value>] [-r <value>] [-t] [--code]

FLAGS
  -c, --cpu=<value>  [default: 10.0000 SYS]
  -h, --help         show CLI help
  -n, --net=<value>  [default: 10.0000 SYS]
  -r, --ram=<value>  [default: 12288]
  -t, --transfer
  --code

DESCRIPTION
  System NewAccount
```

_See code: [src/commands/system/newaccount.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.12/src/commands/system/newaccount.ts)_

## `proton version`

Version of CLI

```
USAGE
  $ proton version

DESCRIPTION
  Version of CLI
```

_See code: [src/commands/version.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.12/src/commands/version.ts)_
<!-- commandsstop -->
