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
Install NodeJS + NPM + CLI
```
curl -Ls https://raw.githubusercontent.com/ProtonProtocol/proton-cli/master/install.sh | sh
```

Install CLI (NPM)
```
npm i -g @proton/cli
```

Install CLI (Yarn)
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
@proton/cli/0.1.21 darwin-arm64 node-v17.6.0
$ proton --help [COMMAND]
USAGE
  $ proton COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`proton account ACCOUNTNAME`](#proton-account-accountname)
* [`proton account:create ACCOUNTNAME`](#proton-accountcreate-accountname)
* [`proton action CONTRACTNAME [ACTIONNAME] [DATA] [AUTHORIZATION]`](#proton-action-contractname-actionname-data-authorization)
* [`proton block:get BLOCKNUMBER`](#proton-blockget-blocknumber)
* [`proton boilerplate [FOLDER]`](#proton-boilerplate-folder)
* [`proton chain:get`](#proton-chainget)
* [`proton chain:info`](#proton-chaininfo)
* [`proton chain:list`](#proton-chainlist)
* [`proton chain:set`](#proton-chainset)
* [`proton contract:abi ACCOUNTNAME`](#proton-contractabi-accountname)
* [`proton contract:deploy ACCOUNT DIRECTORY`](#proton-contractdeploy-account-directory)
* [`proton help [COMMAND]`](#proton-help-command)
* [`proton key:add [PRIVATEKEY]`](#proton-keyadd-privatekey)
* [`proton key:generate`](#proton-keygenerate)
* [`proton key:get PUBLICKEY`](#proton-keyget-publickey)
* [`proton key:list`](#proton-keylist)
* [`proton key:lock`](#proton-keylock)
* [`proton key:remove [PRIVATEKEY]`](#proton-keyremove-privatekey)
* [`proton key:reset`](#proton-keyreset)
* [`proton key:unlock [PASSWORD]`](#proton-keyunlock-password)
* [`proton multisig:contract DIRECTORY`](#proton-multisigcontract-directory)
* [`proton network`](#proton-network)
* [`proton permission ACCOUNTNAME`](#proton-permission-accountname)
* [`proton table CONTRACTNAME [TABLENAME] [SCOPE]`](#proton-table-contractname-tablename-scope)
* [`proton transaction JSON`](#proton-transaction-json)
* [`proton transaction:get TRANSACTIONID`](#proton-transactionget-transactionid)
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

_See code: [src/commands/account/index.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.21/src/commands/account/index.ts)_

## `proton account:create ACCOUNTNAME`

Create New Account

```
USAGE
  $ proton account:create [ACCOUNTNAME]

DESCRIPTION
  Create New Account
```

_See code: [src/commands/account/create.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.21/src/commands/account/create.ts)_

## `proton action CONTRACTNAME [ACTIONNAME] [DATA] [AUTHORIZATION]`

Execute Action

```
USAGE
  $ proton action [CONTRACTNAME] [ACTIONNAME] [DATA] [AUTHORIZATION]

ARGUMENTS
  CONTRACTNAME
  ACTIONNAME
  DATA
  AUTHORIZATION  Account to authorize with

DESCRIPTION
  Execute Action
```

_See code: [src/commands/action/index.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.21/src/commands/action/index.ts)_

## `proton block:get BLOCKNUMBER`

Get Block

```
USAGE
  $ proton block:get [BLOCKNUMBER]

DESCRIPTION
  Get Block
```

_See code: [src/commands/block/get.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.21/src/commands/block/get.ts)_

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

_See code: [src/commands/boilerplate.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.21/src/commands/boilerplate.ts)_

## `proton chain:get`

Get Current Chain

```
USAGE
  $ proton chain:get

DESCRIPTION
  Get Current Chain

ALIASES
  $ proton network
```

_See code: [src/commands/chain/get.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.21/src/commands/chain/get.ts)_

## `proton chain:info`

Get Chain Info

```
USAGE
  $ proton chain:info

DESCRIPTION
  Get Chain Info
```

_See code: [src/commands/chain/info.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.21/src/commands/chain/info.ts)_

## `proton chain:list`

All Networks

```
USAGE
  $ proton chain:list

DESCRIPTION
  All Networks
```

_See code: [src/commands/chain/list.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.21/src/commands/chain/list.ts)_

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

_See code: [src/commands/chain/set.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.21/src/commands/chain/set.ts)_

## `proton contract:abi ACCOUNTNAME`

Get Contract ABI

```
USAGE
  $ proton contract:abi [ACCOUNTNAME]

DESCRIPTION
  Get Contract ABI
```

_See code: [src/commands/contract/abi.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.21/src/commands/contract/abi.ts)_

## `proton contract:deploy ACCOUNT DIRECTORY`

Deploy Contract

```
USAGE
  $ proton contract:deploy [ACCOUNT] [DIRECTORY] [-c] [-a] [-w]

FLAGS
  -a, --abiOnly   Only deploy ABI
  -c, --clear     Removes WASM + ABI from contract
  -w, --wasmOnly  Only deploy WASM

DESCRIPTION
  Deploy Contract
```

_See code: [src/commands/contract/deploy.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.21/src/commands/contract/deploy.ts)_

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

## `proton key:add [PRIVATEKEY]`

Add Key

```
USAGE
  $ proton key:add [PRIVATEKEY]

DESCRIPTION
  Add Key
```

_See code: [src/commands/key/add.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.21/src/commands/key/add.ts)_

## `proton key:generate`

Generate Key

```
USAGE
  $ proton key:generate

DESCRIPTION
  Generate Key
```

_See code: [src/commands/key/generate.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.21/src/commands/key/generate.ts)_

## `proton key:get PUBLICKEY`

Find private key for public key

```
USAGE
  $ proton key:get [PUBLICKEY]

DESCRIPTION
  Find private key for public key
```

_See code: [src/commands/key/get.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.21/src/commands/key/get.ts)_

## `proton key:list`

List All Key

```
USAGE
  $ proton key:list

DESCRIPTION
  List All Key
```

_See code: [src/commands/key/list.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.21/src/commands/key/list.ts)_

## `proton key:lock`

Lock Keys with password

```
USAGE
  $ proton key:lock

DESCRIPTION
  Lock Keys with password
```

_See code: [src/commands/key/lock.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.21/src/commands/key/lock.ts)_

## `proton key:remove [PRIVATEKEY]`

Remove Key

```
USAGE
  $ proton key:remove [PRIVATEKEY]

DESCRIPTION
  Remove Key
```

_See code: [src/commands/key/remove.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.21/src/commands/key/remove.ts)_

## `proton key:reset`

Reset password (Caution: deletes all private keys stored)

```
USAGE
  $ proton key:reset

DESCRIPTION
  Reset password (Caution: deletes all private keys stored)
```

_See code: [src/commands/key/reset.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.21/src/commands/key/reset.ts)_

## `proton key:unlock [PASSWORD]`

Unlock all keys (Caution: Your keys will be stored in plaintext on disk)

```
USAGE
  $ proton key:unlock [PASSWORD]

DESCRIPTION
  Unlock all keys (Caution: Your keys will be stored in plaintext on disk)
```

_See code: [src/commands/key/unlock.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.21/src/commands/key/unlock.ts)_

## `proton multisig:contract DIRECTORY`

Multisig Contract

```
USAGE
  $ proton multisig:contract [DIRECTORY]

DESCRIPTION
  Multisig Contract
```

_See code: [src/commands/multisig/contract.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.21/src/commands/multisig/contract.ts)_

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

## `proton permission ACCOUNTNAME`

Add Key

```
USAGE
  $ proton permission [ACCOUNTNAME]

ARGUMENTS
  ACCOUNTNAME  Account to modify

DESCRIPTION
  Add Key
```

_See code: [src/commands/permission/index.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.21/src/commands/permission/index.ts)_

## `proton table CONTRACTNAME [TABLENAME] [SCOPE]`

Get Table Storage Rows

```
USAGE
  $ proton table [CONTRACTNAME] [TABLENAME] [SCOPE] [-l <value>] [-u <value>] [-k <value>] [-r] [-p] [-c
    <value>] [-i <value>]

FLAGS
  -c, --limit=<value>          [default: 100]
  -i, --indexPosition=<value>  [default: 1]
  -k, --keyType=<value>
  -l, --lowerBound=<value>
  -p, --showPayer
  -r, --reverse
  -u, --upperBound=<value>

DESCRIPTION
  Get Table Storage Rows
```

_See code: [src/commands/table/index.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.21/src/commands/table/index.ts)_

## `proton transaction JSON`

Execute Transaction

```
USAGE
  $ proton transaction [JSON]

DESCRIPTION
  Execute Transaction
```

_See code: [src/commands/transaction/index.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.21/src/commands/transaction/index.ts)_

## `proton transaction:get TRANSACTIONID`

Get Transaction by Transaction ID

```
USAGE
  $ proton transaction:get [TRANSACTIONID]

DESCRIPTION
  Get Transaction by Transaction ID
```

_See code: [src/commands/transaction/get.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.21/src/commands/transaction/get.ts)_

## `proton version`

Version of CLI

```
USAGE
  $ proton version

DESCRIPTION
  Version of CLI
```

_See code: [src/commands/version.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.21/src/commands/version.ts)_
<!-- commandsstop -->
