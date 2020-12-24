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
@proton/cli/0.1.1 darwin-x64 node-v12.19.0
$ proton --help [COMMAND]
USAGE
  $ proton COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`proton boilerplate [FOLDER]`](#proton-boilerplate-folder)
* [`proton generate:key`](#proton-generatekey)
* [`proton help [COMMAND]`](#proton-help-command)
* [`proton install [VERSION]`](#proton-install-version)
* [`proton network:all`](#proton-networkall)
* [`proton network:get`](#proton-networkget)
* [`proton network:set CHAIN`](#proton-networkset-chain)
* [`proton set:contract ACCOUNT DIRECTORY`](#proton-setcontract-account-directory)
* [`proton system:dappreg ACCOUNT`](#proton-systemdappreg-account)
* [`proton system:newaccount ACCOUNT OWNER ACTIVE`](#proton-systemnewaccount-account-owner-active)
* [`proton version`](#proton-version)
* [`proton wallet:create [NAME]`](#proton-walletcreate-name)
* [`proton wallet:createkey [NAME] [TYPE]`](#proton-walletcreatekey-name-type)
* [`proton wallet:importkey [NAME] [PRIVATE_KEY]`](#proton-walletimportkey-name-private_key)
* [`proton wallet:list`](#proton-walletlist)
* [`proton wallet:listprivatekeys [NAME]`](#proton-walletlistprivatekeys-name)
* [`proton wallet:listpublickeys`](#proton-walletlistpublickeys)
* [`proton wallet:lock [NAME]`](#proton-walletlock-name)
* [`proton wallet:lockall`](#proton-walletlockall)
* [`proton wallet:open [NAME]`](#proton-walletopen-name)
* [`proton wallet:removekey [NAME] [PUBLIC_KEY]`](#proton-walletremovekey-name-public_key)
* [`proton wallet:stopkeosd`](#proton-walletstopkeosd)
* [`proton wallet:unlock [NAME]`](#proton-walletunlock-name)

## `proton boilerplate [FOLDER]`

Boilerplate a new Proton Project with contract, frontend and tests

```
USAGE
  $ proton boilerplate [FOLDER]

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/boilerplate.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.1/src/commands/boilerplate.ts)_

## `proton generate:key`

Generate Key

```
USAGE
  $ proton generate:key
```

_See code: [src/commands/generate/key.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.1/src/commands/generate/key.ts)_

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

_See code: [src/commands/install.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.1/src/commands/install.ts)_

## `proton network:all`

All Networks

```
USAGE
  $ proton network:all
```

_See code: [src/commands/network/all.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.1/src/commands/network/all.ts)_

## `proton network:get`

Get Current Network

```
USAGE
  $ proton network:get

ALIASES
  $ proton network
```

_See code: [src/commands/network/get.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.1/src/commands/network/get.ts)_

## `proton network:set CHAIN`

Set Current Network

```
USAGE
  $ proton network:set CHAIN
```

_See code: [src/commands/network/set.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.1/src/commands/network/set.ts)_

## `proton set:contract ACCOUNT DIRECTORY`

Set Contract

```
USAGE
  $ proton set:contract ACCOUNT DIRECTORY
```

_See code: [src/commands/set/contract.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.1/src/commands/set/contract.ts)_

## `proton system:dappreg ACCOUNT`

Set Contract

```
USAGE
  $ proton system:dappreg ACCOUNT
```

_See code: [src/commands/system/dappreg.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.1/src/commands/system/dappreg.ts)_

## `proton system:newaccount ACCOUNT OWNER ACTIVE`

System NewAccount

```
USAGE
  $ proton system:newaccount ACCOUNT OWNER ACTIVE

OPTIONS
  -c, --cpu=cpu   [default: 10.0000 SYS]
  -h, --help      show CLI help
  -n, --net=net   [default: 10.0000 SYS]
  -r, --ram=ram   [default: 12288]
  -t, --transfer
  --code
```

_See code: [src/commands/system/newaccount.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.1/src/commands/system/newaccount.ts)_

## `proton version`

Version of CLI

```
USAGE
  $ proton version
```

_See code: [src/commands/version.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.1/src/commands/version.ts)_

## `proton wallet:create [NAME]`

Create new local wallet

```
USAGE
  $ proton wallet:create [NAME]
```

_See code: [src/commands/wallet/create.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.1/src/commands/wallet/create.ts)_

## `proton wallet:createkey [NAME] [TYPE]`

Create key in wallet

```
USAGE
  $ proton wallet:createkey [NAME] [TYPE]
```

_See code: [src/commands/wallet/createkey.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.1/src/commands/wallet/createkey.ts)_

## `proton wallet:importkey [NAME] [PRIVATE_KEY]`

Import private key to wallet

```
USAGE
  $ proton wallet:importkey [NAME] [PRIVATE_KEY]
```

_See code: [src/commands/wallet/importkey.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.1/src/commands/wallet/importkey.ts)_

## `proton wallet:list`

List open wallets

```
USAGE
  $ proton wallet:list

ALIASES
  $ proton wallet
```

_See code: [src/commands/wallet/list.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.1/src/commands/wallet/list.ts)_

## `proton wallet:listprivatekeys [NAME]`

List private keys for a single wallet

```
USAGE
  $ proton wallet:listprivatekeys [NAME]
```

_See code: [src/commands/wallet/listprivatekeys.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.1/src/commands/wallet/listprivatekeys.ts)_

## `proton wallet:listpublickeys`

List public keys for all wallets

```
USAGE
  $ proton wallet:listpublickeys
```

_See code: [src/commands/wallet/listpublickeys.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.1/src/commands/wallet/listpublickeys.ts)_

## `proton wallet:lock [NAME]`

Lock local wallet

```
USAGE
  $ proton wallet:lock [NAME]
```

_See code: [src/commands/wallet/lock.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.1/src/commands/wallet/lock.ts)_

## `proton wallet:lockall`

Lock all local wallets

```
USAGE
  $ proton wallet:lockall
```

_See code: [src/commands/wallet/lockall.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.1/src/commands/wallet/lockall.ts)_

## `proton wallet:open [NAME]`

Open local wallet

```
USAGE
  $ proton wallet:open [NAME]
```

_See code: [src/commands/wallet/open.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.1/src/commands/wallet/open.ts)_

## `proton wallet:removekey [NAME] [PUBLIC_KEY]`

Remove private key from wallet

```
USAGE
  $ proton wallet:removekey [NAME] [PUBLIC_KEY]
```

_See code: [src/commands/wallet/removekey.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.1/src/commands/wallet/removekey.ts)_

## `proton wallet:stopkeosd`

Stops Keosd

```
USAGE
  $ proton wallet:stopkeosd
```

_See code: [src/commands/wallet/stopkeosd.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.1/src/commands/wallet/stopkeosd.ts)_

## `proton wallet:unlock [NAME]`

Unlock local wallet

```
USAGE
  $ proton wallet:unlock [NAME]
```

_See code: [src/commands/wallet/unlock.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.1/src/commands/wallet/unlock.ts)_
<!-- commandsstop -->
