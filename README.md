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
Install CLI (NPM)
```
npm i -g @proton/cli
```

Install CLI (Yarn)
```
yarn global add @proton/cli
```

If you need to install NodeJS, have a look at [INSTALL_NODE.md](INSTALL_NODE.md)

If you get a missing write access error on Mac/Linux, first run:
```
sudo chown -R $USER /usr/local/lib/node_modules
sudo chown -R $USER /usr/local/bin
```

# Usage
<!-- usage -->
```sh-session
$ npm install -g @proton/cli
$ proton COMMAND
running command...
$ proton (--version)
@proton/cli/0.1.45 darwin-arm64 node-v16.14.0
$ proton --help [COMMAND]
USAGE
  $ proton COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`proton account ACCOUNT`](#proton-account-account)
* [`proton account:create ACCOUNT`](#proton-accountcreate-account)
* [`proton action CONTRACT [ACTION] [DATA] [AUTHORIZATION]`](#proton-action-contract-action-data-authorization)
* [`proton block:get BLOCKNUMBER`](#proton-blockget-blocknumber)
* [`proton boilerplate [FOLDER]`](#proton-boilerplate-folder)
* [`proton chain:get`](#proton-chainget)
* [`proton chain:info`](#proton-chaininfo)
* [`proton chain:list`](#proton-chainlist)
* [`proton chain:set [CHAIN]`](#proton-chainset-chain)
* [`proton contract:abi ACCOUNT`](#proton-contractabi-account)
* [`proton contract:create CONTRACTNAME`](#proton-contractcreate-contractname)
* [`proton contract:deploy ACCOUNT DIRECTORY`](#proton-contractdeploy-account-directory)
* [`proton faucet`](#proton-faucet)
* [`proton faucet:claim SYMBOL AUTHORIZATION`](#proton-faucetclaim-symbol-authorization)
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
* [`proton permission ACCOUNT`](#proton-permission-account)
* [`proton permission:link ACCOUNT PERMISSION CONTRACT [ACTION]`](#proton-permissionlink-account-permission-contract-action)
* [`proton permission:unlink ACCOUNT CONTRACT [ACTION]`](#proton-permissionunlink-account-contract-action)
* [`proton psr URI`](#proton-psr-uri)
* [`proton ram`](#proton-ram)
* [`proton ram:buy BUYER RECEIVER BYTES`](#proton-rambuy-buyer-receiver-bytes)
* [`proton table CONTRACT [TABLE] [SCOPE]`](#proton-table-contract-table-scope)
* [`proton transaction JSON`](#proton-transaction-json)
* [`proton transaction:get ID`](#proton-transactionget-id)
* [`proton version`](#proton-version)

## `proton account ACCOUNT`

Get Account Information

```
USAGE
  $ proton account [ACCOUNT] [-r] [-t]

FLAGS
  -r, --raw
  -t, --tokens  Show token balances

DESCRIPTION
  Get Account Information
```

_See code: [src/commands/account/index.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/account/index.ts)_

## `proton account:create ACCOUNT`

Create New Account

```
USAGE
  $ proton account:create [ACCOUNT]

DESCRIPTION
  Create New Account
```

_See code: [src/commands/account/create.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/account/create.ts)_

## `proton action CONTRACT [ACTION] [DATA] [AUTHORIZATION]`

Execute Action

```
USAGE
  $ proton action [CONTRACT] [ACTION] [DATA] [AUTHORIZATION]

ARGUMENTS
  CONTRACT
  ACTION
  DATA
  AUTHORIZATION  Account to authorize with

DESCRIPTION
  Execute Action
```

_See code: [src/commands/action/index.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/action/index.ts)_

## `proton block:get BLOCKNUMBER`

Get Block

```
USAGE
  $ proton block:get [BLOCKNUMBER]

DESCRIPTION
  Get Block
```

_See code: [src/commands/block/get.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/block/get.ts)_

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

_See code: [src/commands/boilerplate.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/boilerplate.ts)_

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

_See code: [src/commands/chain/get.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/chain/get.ts)_

## `proton chain:info`

Get Chain Info

```
USAGE
  $ proton chain:info

DESCRIPTION
  Get Chain Info
```

_See code: [src/commands/chain/info.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/chain/info.ts)_

## `proton chain:list`

All Networks

```
USAGE
  $ proton chain:list

DESCRIPTION
  All Networks
```

_See code: [src/commands/chain/list.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/chain/list.ts)_

## `proton chain:set [CHAIN]`

Set Chain

```
USAGE
  $ proton chain:set [CHAIN]

ARGUMENTS
  CHAIN  Specific chain

DESCRIPTION
  Set Chain
```

_See code: [src/commands/chain/set.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/chain/set.ts)_

## `proton contract:abi ACCOUNT`

Get Contract ABI

```
USAGE
  $ proton contract:abi [ACCOUNT]

DESCRIPTION
  Get Contract ABI
```

_See code: [src/commands/contract/abi.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/contract/abi.ts)_

## `proton contract:create CONTRACTNAME`

```
USAGE
  $ proton contract:create [CONTRACTNAME] [-c <value>] [-o <value>]

ARGUMENTS
  CONTRACTNAME  The name of the contract. 1-12 chars, only lowercase a-z and numbers 1-5 are possible

FLAGS
  -c, --class=<value>   The name of Typescript class for the contract
  -o, --output=<value>  The relative path to folder the the contract should be located. Current folder by default.
```

_See code: [src/commands/contract/create.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/contract/create.ts)_

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

_See code: [src/commands/contract/deploy.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/contract/deploy.ts)_

## `proton faucet`

List all faucets

```
USAGE
  $ proton faucet

DESCRIPTION
  List all faucets
```

_See code: [src/commands/faucet/index.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/faucet/index.ts)_

## `proton faucet:claim SYMBOL AUTHORIZATION`

Claim faucet

```
USAGE
  $ proton faucet:claim [SYMBOL] [AUTHORIZATION]

ARGUMENTS
  SYMBOL
  AUTHORIZATION  Authorization like account1@active

DESCRIPTION
  Claim faucet
```

_See code: [src/commands/faucet/claim.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/faucet/claim.ts)_

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

_See code: [src/commands/key/add.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/key/add.ts)_

## `proton key:generate`

Generate Key

```
USAGE
  $ proton key:generate

DESCRIPTION
  Generate Key
```

_See code: [src/commands/key/generate.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/key/generate.ts)_

## `proton key:get PUBLICKEY`

Find private key for public key

```
USAGE
  $ proton key:get [PUBLICKEY]

DESCRIPTION
  Find private key for public key
```

_See code: [src/commands/key/get.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/key/get.ts)_

## `proton key:list`

List All Key

```
USAGE
  $ proton key:list

DESCRIPTION
  List All Key
```

_See code: [src/commands/key/list.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/key/list.ts)_

## `proton key:lock`

Lock Keys with password

```
USAGE
  $ proton key:lock

DESCRIPTION
  Lock Keys with password
```

_See code: [src/commands/key/lock.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/key/lock.ts)_

## `proton key:remove [PRIVATEKEY]`

Remove Key

```
USAGE
  $ proton key:remove [PRIVATEKEY]

DESCRIPTION
  Remove Key
```

_See code: [src/commands/key/remove.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/key/remove.ts)_

## `proton key:reset`

Reset password (Caution: deletes all private keys stored)

```
USAGE
  $ proton key:reset

DESCRIPTION
  Reset password (Caution: deletes all private keys stored)
```

_See code: [src/commands/key/reset.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/key/reset.ts)_

## `proton key:unlock [PASSWORD]`

Unlock all keys (Caution: Your keys will be stored in plaintext on disk)

```
USAGE
  $ proton key:unlock [PASSWORD]

DESCRIPTION
  Unlock all keys (Caution: Your keys will be stored in plaintext on disk)
```

_See code: [src/commands/key/unlock.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/key/unlock.ts)_

## `proton multisig:contract DIRECTORY`

Multisig Contract

```
USAGE
  $ proton multisig:contract [DIRECTORY]

DESCRIPTION
  Multisig Contract
```

_See code: [src/commands/multisig/contract.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/multisig/contract.ts)_

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

## `proton permission ACCOUNT`

Add Key

```
USAGE
  $ proton permission [ACCOUNT]

ARGUMENTS
  ACCOUNT  Account to modify

DESCRIPTION
  Add Key
```

_See code: [src/commands/permission/index.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/permission/index.ts)_

## `proton permission:link ACCOUNT PERMISSION CONTRACT [ACTION]`

Link Auth

```
USAGE
  $ proton permission:link [ACCOUNT] [PERMISSION] [CONTRACT] [ACTION] [-p <value>]

FLAGS
  -p, --permission=<value>  Permission to sign with (e.g. account@active)

DESCRIPTION
  Link Auth
```

_See code: [src/commands/permission/link.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/permission/link.ts)_

## `proton permission:unlink ACCOUNT CONTRACT [ACTION]`

Unlink Auth

```
USAGE
  $ proton permission:unlink [ACCOUNT] [CONTRACT] [ACTION] [-p <value>]

FLAGS
  -p, --permission=<value>

DESCRIPTION
  Unlink Auth
```

_See code: [src/commands/permission/unlink.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/permission/unlink.ts)_

## `proton psr URI`

Create Session

```
USAGE
  $ proton psr [URI]

DESCRIPTION
  Create Session
```

_See code: [src/commands/psr/index.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/psr/index.ts)_

## `proton ram`

List Ram price

```
USAGE
  $ proton ram

DESCRIPTION
  List Ram price
```

_See code: [src/commands/ram/index.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/ram/index.ts)_

## `proton ram:buy BUYER RECEIVER BYTES`

Claim faucet

```
USAGE
  $ proton ram:buy [BUYER] [RECEIVER] [BYTES] [-p <value>]

ARGUMENTS
  BUYER     Account paying for RAM
  RECEIVER  Account receiving RAM
  BYTES     Bytes of RAM to purchase

FLAGS
  -p, --authorization=<value>  Use a specific authorization other than buyer@active

DESCRIPTION
  Claim faucet
```

_See code: [src/commands/ram/buy.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/ram/buy.ts)_

## `proton table CONTRACT [TABLE] [SCOPE]`

Get Table Storage Rows

```
USAGE
  $ proton table [CONTRACT] [TABLE] [SCOPE] [-l <value>] [-u <value>] [-k <value>] [-r] [-p] [-c <value>]
    [-i <value>]

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

_See code: [src/commands/table/index.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/table/index.ts)_

## `proton transaction JSON`

Execute Transaction

```
USAGE
  $ proton transaction [JSON]

DESCRIPTION
  Execute Transaction
```

_See code: [src/commands/transaction/index.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/transaction/index.ts)_

## `proton transaction:get ID`

Get Transaction by Transaction ID

```
USAGE
  $ proton transaction:get [ID]

DESCRIPTION
  Get Transaction by Transaction ID
```

_See code: [src/commands/transaction/get.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/transaction/get.ts)_

## `proton version`

Version of CLI

```
USAGE
  $ proton version

DESCRIPTION
  Version of CLI
```

_See code: [src/commands/version.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.45/src/commands/version.ts)_
<!-- commandsstop -->
