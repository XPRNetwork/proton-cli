# @proton/cli

Proton CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@proton/cli.svg)](https://npmjs.org/package/@proton/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@proton/cli.svg)](https://npmjs.org/package/@proton/cli)
[![License](https://img.shields.io/npm/l/@proton/cli.svg)](https://github.com/ProtonProtocol/proton-cli/blob/master/package.json)

<!-- toc -->
* [@proton/cli](#protoncli)
* [Installation](#installation)
* [Install NodeJS](#install-nodejs)
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

If you get a missing write access error on Mac/Linux, first run:

```
sudo chown -R $USER /usr/local/lib/node_modules
sudo chown -R $USER /usr/local/bin
```

# Install NodeJS

> You can skip this step if you already have NodeJS installed

**1. Install NVM**

MacOS/Linux/WSL:

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```

Windows 7/10/11:

Download nvm-setup.zip and run it [here](https://github.com/coreybutler/nvm-windows/releases). After installation, open a new PowerShell window as administrator.

**2. Install NodeJS**

```
nvm install 16
nvm use 16
```

# Usage

<!-- usage -->
```sh-session
$ npm install -g @proton/cli
$ proton COMMAND
running command...
$ proton (--version)
@proton/cli/0.1.98 darwin-arm64 node-v22.22.0
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
* [`proton account:create-funded ACCOUNT`](#proton-accountcreate-funded-account)
* [`proton action CONTRACT [ACTION] [DATA] [AUTHORIZATION]`](#proton-action-contract-action-data-authorization)
* [`proton block:get BLOCKNUMBER`](#proton-blockget-blocknumber)
* [`proton boilerplate [FOLDER]`](#proton-boilerplate-folder)
* [`proton chain:get`](#proton-chainget)
* [`proton chain:info`](#proton-chaininfo)
* [`proton chain:list`](#proton-chainlist)
* [`proton chain:set [CHAIN]`](#proton-chainset-chain)
* [`proton contract:abi ACCOUNT`](#proton-contractabi-account)
* [`proton contract:clear ACCOUNT`](#proton-contractclear-account)
* [`proton contract:enableinline ACCOUNT`](#proton-contractenableinline-account)
* [`proton contract:set [ACCOUNT] [SOURCE]`](#proton-contractset-account-source)
* [`proton encode:name ACCOUNT`](#proton-encodename-account)
* [`proton encode:symbol SYMBOL PRECISION`](#proton-encodesymbol-symbol-precision)
* [`proton endpoint`](#proton-endpoint)
* [`proton endpoint:default [ENDPOINT]`](#proton-endpointdefault-endpoint)
* [`proton endpoint:get`](#proton-endpointget)
* [`proton endpoint:set [ENDPOINT]`](#proton-endpointset-endpoint)
* [`proton faucet`](#proton-faucet)
* [`proton faucet:claim SYMBOL AUTHORIZATION`](#proton-faucetclaim-symbol-authorization)
* [`proton generate:action`](#proton-generateaction)
* [`proton generate:contract CONTRACTNAME`](#proton-generatecontract-contractname)
* [`proton generate:inlineaction ACTIONNAME`](#proton-generateinlineaction-actionname)
* [`proton generate:table TABLENAME`](#proton-generatetable-tablename)
* [`proton key:add [PRIVATEKEY]`](#proton-keyadd-privatekey)
* [`proton key:generate`](#proton-keygenerate)
* [`proton key:get PUBLICKEY`](#proton-keyget-publickey)
* [`proton key:list`](#proton-keylist)
* [`proton key:lock`](#proton-keylock)
* [`proton key:remove [PRIVATEKEY]`](#proton-keyremove-privatekey)
* [`proton key:reset`](#proton-keyreset)
* [`proton key:reveal-disable`](#proton-keyreveal-disable)
* [`proton key:reveal-setup`](#proton-keyreveal-setup)
* [`proton key:unlock [PASSWORD]`](#proton-keyunlock-password)
* [`proton msig:approve PROPOSER PROPOSAL AUTH`](#proton-msigapprove-proposer-proposal-auth)
* [`proton msig:cancel PROPOSALNAME AUTH`](#proton-msigcancel-proposalname-auth)
* [`proton msig:exec PROPOSER PROPOSAL AUTH`](#proton-msigexec-proposer-proposal-auth)
* [`proton msig:propose PROPOSALNAME ACTIONS AUTH`](#proton-msigpropose-proposalname-actions-auth)
* [`proton network`](#proton-network)
* [`proton permission ACCOUNT`](#proton-permission-account)
* [`proton permission:link ACCOUNT PERMISSION CONTRACT [ACTION]`](#proton-permissionlink-account-permission-contract-action)
* [`proton permission:unlink ACCOUNT CONTRACT [ACTION]`](#proton-permissionunlink-account-contract-action)
* [`proton psr URI`](#proton-psr-uri)
* [`proton ram`](#proton-ram)
* [`proton ram:buy BUYER RECEIVER BYTES`](#proton-rambuy-buyer-receiver-bytes)
* [`proton rpc:accountsbyauthorizers AUTHORIZATIONS [KEYS]`](#proton-rpcaccountsbyauthorizers-authorizations-keys)
* [`proton scan ACCOUNT`](#proton-scan-account)
* [`proton table CONTRACT [TABLE] [SCOPE]`](#proton-table-contract-table-scope)
* [`proton transaction JSON`](#proton-transaction-json)
* [`proton transaction:get ID`](#proton-transactionget-id)
* [`proton transaction:push TRANSACTION`](#proton-transactionpush-transaction)
* [`proton version`](#proton-version)

## `proton account ACCOUNT`

Get Account Information

```
USAGE
  $ proton account ACCOUNT [-r] [-t]

FLAGS
  -r, --raw
  -t, --tokens  Show token balances

DESCRIPTION
  Get Account Information
```

_See code: [src/commands/account/index.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/account/index.ts)_

## `proton account:create ACCOUNT`

Create New Account

```
USAGE
  $ proton account:create ACCOUNT

DESCRIPTION
  Create New Account
```

_See code: [src/commands/account/create.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/account/create.ts)_

## `proton account:create-funded ACCOUNT`

Create a new account funded by an existing account (no email verification).

```
USAGE
  $ proton account:create-funded ACCOUNT -c <value> [-k <value>] [-r <value>] [-o <value>]

ARGUMENTS
  ACCOUNT  New account name (4-12 chars, a-z and 1-5 only)

FLAGS
  -c, --creator=<value>  (required) Existing account that pays for and creates the new account
  -k, --key=<value>      Public key for new account (PUB_K1_... format). Generates new key if omitted
  -o, --owner=<value>    Account to add as backup owner (can recover/rotate keys if agent key is lost)
  -r, --ram=<value>      [default: 3000] RAM bytes to purchase for new account (minimum 3000)

DESCRIPTION
  Create a new account funded by an existing account (no email verification).

  The creator account pays for RAM and signs the transaction.
  CPU and NET bandwidth are delegated for free by the network.

  Account naming rules:
  - Must be 4-12 characters long
  - Only lowercase letters a-z and digits 1-5 are allowed
  - Periods (.) are allowed but the suffix must be owned by the creator
  - Characters 0, 6, 7, 8, 9 are NOT allowed
  - Examples: myaccount, agent11111, test.paul

  Security:
  Use --owner to add a backup account to the owner permission.
  This allows the designated owner to recover or rotate keys
  on the new account if the generated key is lost or compromised.
  The owner permission threshold is set to 1, so either the key
  or the owner account can act independently.

  Cost: ~6-7 XPR per 3000 bytes of RAM (default).
  The creator account must hold enough XPR to cover RAM costs.

EXAMPLES
  $ proton account:create-funded myaccount --creator fundingacct

  $ proton account:create-funded myaccount -c fundingacct --ram 8192

  $ proton account:create-funded myaccount -c fundingacct -k PUB_K1_...

  $ proton account:create-funded agentacct -c fundingacct --owner paul123
```

_See code: [src/commands/account/create-funded.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/account/create-funded.ts)_

## `proton action CONTRACT [ACTION] [DATA] [AUTHORIZATION]`

Execute Action

```
USAGE
  $ proton action CONTRACT [ACTION] [DATA] [AUTHORIZATION]

ARGUMENTS
  CONTRACT
  [ACTION]
  [DATA]
  [AUTHORIZATION]  Account to authorize with

DESCRIPTION
  Execute Action
```

_See code: [src/commands/action/index.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/action/index.ts)_

## `proton block:get BLOCKNUMBER`

Get Block

```
USAGE
  $ proton block:get BLOCKNUMBER

DESCRIPTION
  Get Block
```

_See code: [src/commands/block/get.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/block/get.ts)_

## `proton boilerplate [FOLDER]`

Boilerplate a new Proton Project with contract, frontend and tests

```
USAGE
  $ proton boilerplate [FOLDER]

DESCRIPTION
  Boilerplate a new Proton Project with contract, frontend and tests
```

_See code: [src/commands/boilerplate.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/boilerplate.ts)_

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

_See code: [src/commands/chain/get.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/chain/get.ts)_

## `proton chain:info`

Get Chain Info

```
USAGE
  $ proton chain:info

DESCRIPTION
  Get Chain Info
```

_See code: [src/commands/chain/info.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/chain/info.ts)_

## `proton chain:list`

All Networks

```
USAGE
  $ proton chain:list

DESCRIPTION
  All Networks
```

_See code: [src/commands/chain/list.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/chain/list.ts)_

## `proton chain:set [CHAIN]`

Set Chain

```
USAGE
  $ proton chain:set [CHAIN]

ARGUMENTS
  [CHAIN]  Specific chain

DESCRIPTION
  Set Chain
```

_See code: [src/commands/chain/set.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/chain/set.ts)_

## `proton contract:abi ACCOUNT`

Get Contract ABI

```
USAGE
  $ proton contract:abi ACCOUNT

DESCRIPTION
  Get Contract ABI
```

_See code: [src/commands/contract/abi.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/contract/abi.ts)_

## `proton contract:clear ACCOUNT`

Clean Contract

```
USAGE
  $ proton contract:clear ACCOUNT [-a] [-w]

FLAGS
  -a, --abiOnly   Only remove ABI
  -w, --wasmOnly  Only remove WASM

DESCRIPTION
  Clean Contract
```

_See code: [src/commands/contract/clear.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/contract/clear.ts)_

## `proton contract:enableinline ACCOUNT`

Enable Inline Actions on a Contract

```
USAGE
  $ proton contract:enableinline ACCOUNT [-p <value>]

ARGUMENTS
  ACCOUNT  Contract account to enable

FLAGS
  -p, --authorization=<value>  Use a specific authorization other than contract@active

DESCRIPTION
  Enable Inline Actions on a Contract
```

_See code: [src/commands/contract/enableinline.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/contract/enableinline.ts)_

## `proton contract:set [ACCOUNT] [SOURCE]`

Deploy Contract (WASM + ABI)

```
USAGE
  $ proton contract:set [ACCOUNT] [SOURCE] [-c] [-a] [-w] [-s]

ARGUMENTS
  [ACCOUNT]  The account to publish the contract to (or set ACCOUNT in .contract)
  [SOURCE]   Path of directory with WASM and ABI or GitHub folder URL (or set SOURCE in .contract)

FLAGS
  -a, --abiOnly        Only deploy ABI
  -c, --clear          Removes WASM + ABI from contract
  -s, --disableInline  Disable inline actions on contract
  -w, --wasmOnly       Only deploy WASM

DESCRIPTION
  Deploy Contract (WASM + ABI)
```

_See code: [src/commands/contract/set.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/contract/set.ts)_

## `proton encode:name ACCOUNT`

Encode Name

```
USAGE
  $ proton encode:name ACCOUNT

DESCRIPTION
  Encode Name
```

_See code: [src/commands/encode/name.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/encode/name.ts)_

## `proton encode:symbol SYMBOL PRECISION`

Encode Symbol

```
USAGE
  $ proton encode:symbol SYMBOL PRECISION

DESCRIPTION
  Encode Symbol
```

_See code: [src/commands/encode/symbol.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/encode/symbol.ts)_

## `proton endpoint`

Get Current enpoint

```
USAGE
  $ proton endpoint

DESCRIPTION
  Get Current enpoint

ALIASES
  $ proton endpoint
```

## `proton endpoint:default [ENDPOINT]`

Restore default enpoint

```
USAGE
  $ proton endpoint:default [ENDPOINT]

ARGUMENTS
  [ENDPOINT]  Restore default endpoints

DESCRIPTION
  Restore default enpoint
```

_See code: [src/commands/endpoint/default.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/endpoint/default.ts)_

## `proton endpoint:get`

Get Current enpoint

```
USAGE
  $ proton endpoint:get

DESCRIPTION
  Get Current enpoint

ALIASES
  $ proton endpoint
```

_See code: [src/commands/endpoint/get.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/endpoint/get.ts)_

## `proton endpoint:set [ENDPOINT]`

Set current enpoint

```
USAGE
  $ proton endpoint:set [ENDPOINT]

ARGUMENTS
  [ENDPOINT]  Specific endpoint

DESCRIPTION
  Set current enpoint
```

_See code: [src/commands/endpoint/set.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/endpoint/set.ts)_

## `proton faucet`

List all faucets

```
USAGE
  $ proton faucet

DESCRIPTION
  List all faucets
```

_See code: [src/commands/faucet/index.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/faucet/index.ts)_

## `proton faucet:claim SYMBOL AUTHORIZATION`

Claim faucet

```
USAGE
  $ proton faucet:claim SYMBOL AUTHORIZATION

ARGUMENTS
  SYMBOL
  AUTHORIZATION  Authorization like account1@active

DESCRIPTION
  Claim faucet
```

_See code: [src/commands/faucet/claim.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/faucet/claim.ts)_

## `proton generate:action`

Add extra actions to the smart contract

```
USAGE
  $ proton generate:action [-o <value>] [-c <value>]

FLAGS
  -c, --contract=<value>  The name of the contract for table. 1-12 chars, only lowercase a-z and numbers 1-5 are
                          possible
  -o, --output=<value>    The relative path to folder where the contract should be located. Current folder by default.

DESCRIPTION
  Add extra actions to the smart contract
```

_See code: [src/commands/generate/action.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/generate/action.ts)_

## `proton generate:contract CONTRACTNAME`

Create new smart contract

```
USAGE
  $ proton generate:contract CONTRACTNAME [-o <value>]

ARGUMENTS
  CONTRACTNAME  The name of the contract. 1-12 chars, only lowercase a-z and numbers 1-5 are possible

FLAGS
  -o, --output=<value>  The relative path to folder where the contract should be located. Current folder by default.

DESCRIPTION
  Create new smart contract
```

_See code: [src/commands/generate/contract.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/generate/contract.ts)_

## `proton generate:inlineaction ACTIONNAME`

Add inline action for the smart contract

```
USAGE
  $ proton generate:inlineaction ACTIONNAME [-o <value>] [-c <value>]

ARGUMENTS
  ACTIONNAME  The name of the inline action's class.

FLAGS
  -c, --contract=<value>  The name of the contract for table. 1-12 chars, only lowercase a-z and numbers 1-5 are
                          possible
  -o, --output=<value>    The relative path to folder where the contract should be located. Current folder by default.

DESCRIPTION
  Add inline action for the smart contract
```

_See code: [src/commands/generate/inlineaction.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/generate/inlineaction.ts)_

## `proton generate:table TABLENAME`

Add table for the smart contract

```
USAGE
  $ proton generate:table TABLENAME [-t <value>] [-s] [-o <value>] [-c <value>]

ARGUMENTS
  TABLENAME  The name of the contract's table. 1-12 chars, only lowercase a-z and numbers 1-5 are possible

FLAGS
  -c, --contract=<value>  The name of the contract for table. 1-12 chars, only lowercase a-z and numbers 1-5 are
                          possible
  -o, --output=<value>    The relative path to folder where the contract should be located. Current folder by default.
  -s, --singleton         Create a singleton table?
  -t, --class=<value>     The name of Typescript class for the table

DESCRIPTION
  Add table for the smart contract
```

_See code: [src/commands/generate/table.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/generate/table.ts)_

## `proton key:add [PRIVATEKEY]`

Manage Keys

```
USAGE
  $ proton key:add [PRIVATEKEY]

DESCRIPTION
  Manage Keys
```

_See code: [src/commands/key/add.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/key/add.ts)_

## `proton key:generate`

Generate Key

```
USAGE
  $ proton key:generate

DESCRIPTION
  Generate Key
```

_See code: [src/commands/key/generate.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/key/generate.ts)_

## `proton key:get PUBLICKEY`

Reveal the private key for a saved public key (gated by the reveal password if one is set)

```
USAGE
  $ proton key:get PUBLICKEY [-f]

FLAGS
  -f, --force  Skip the typed confirmation and TTY check. Intended for non-interactive scripts. Does NOT skip the reveal
               password if one is set.

DESCRIPTION
  Reveal the private key for a saved public key (gated by the reveal password if one is set)
```

_See code: [src/commands/key/get.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/key/get.ts)_

## `proton key:list`

List saved keys. Shows public keys and associated accounts by default; pass --reveal-private to include private keys (gated by the reveal password if one is set).

```
USAGE
  $ proton key:list [-r] [-f]

FLAGS
  -f, --force           Skip the typed confirmation and TTY check when used with --reveal-private. Intended for
                        non-interactive scripts. Does NOT skip the reveal password if one is set.
  -r, --reveal-private  Include private keys in the output (requires the reveal password if set, or a typed confirmation
                        otherwise)

DESCRIPTION
  List saved keys. Shows public keys and associated accounts by default; pass --reveal-private to include private keys
  (gated by the reveal password if one is set).
```

_See code: [src/commands/key/list.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/key/list.ts)_

## `proton key:lock`

Lock Keys with password

```
USAGE
  $ proton key:lock

DESCRIPTION
  Lock Keys with password
```

_See code: [src/commands/key/lock.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/key/lock.ts)_

## `proton key:remove [PRIVATEKEY]`

Remove Key

```
USAGE
  $ proton key:remove [PRIVATEKEY]

DESCRIPTION
  Remove Key
```

_See code: [src/commands/key/remove.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/key/remove.ts)_

## `proton key:reset`

Reset password (Caution: deletes all private keys stored)

```
USAGE
  $ proton key:reset

DESCRIPTION
  Reset password (Caution: deletes all private keys stored)
```

_See code: [src/commands/key/reset.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/key/reset.ts)_

## `proton key:reveal-disable`

Remove the reveal password (requires entering the current one)

```
USAGE
  $ proton key:reveal-disable

DESCRIPTION
  Remove the reveal password (requires entering the current one)
```

_See code: [src/commands/key/reveal-disable.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/key/reveal-disable.ts)_

## `proton key:reveal-setup`

Set or change the reveal password required to view private keys via key:get or key:list --reveal-private

```
USAGE
  $ proton key:reveal-setup

DESCRIPTION
  Set or change the reveal password required to view private keys via key:get or key:list --reveal-private
```

_See code: [src/commands/key/reveal-setup.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/key/reveal-setup.ts)_

## `proton key:unlock [PASSWORD]`

Unlock all keys (Caution: Your keys will be stored in plaintext on disk)

```
USAGE
  $ proton key:unlock [PASSWORD]

DESCRIPTION
  Unlock all keys (Caution: Your keys will be stored in plaintext on disk)
```

_See code: [src/commands/key/unlock.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/key/unlock.ts)_

## `proton msig:approve PROPOSER PROPOSAL AUTH`

Multisig Approve

```
USAGE
  $ proton msig:approve PROPOSER PROPOSAL AUTH

DESCRIPTION
  Multisig Approve
```

_See code: [src/commands/msig/approve.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/msig/approve.ts)_

## `proton msig:cancel PROPOSALNAME AUTH`

Multisig Cancel

```
USAGE
  $ proton msig:cancel PROPOSALNAME AUTH

DESCRIPTION
  Multisig Cancel
```

_See code: [src/commands/msig/cancel.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/msig/cancel.ts)_

## `proton msig:exec PROPOSER PROPOSAL AUTH`

Multisig Execute

```
USAGE
  $ proton msig:exec PROPOSER PROPOSAL AUTH

DESCRIPTION
  Multisig Execute
```

_See code: [src/commands/msig/exec.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/msig/exec.ts)_

## `proton msig:propose PROPOSALNAME ACTIONS AUTH`

Multisig Propose

```
USAGE
  $ proton msig:propose PROPOSALNAME ACTIONS AUTH [-b <value>] [-x <value>]

FLAGS
  -b, --blocksBehind=<value>   [default: 30]
  -x, --expireSeconds=<value>  [default: 604800]

DESCRIPTION
  Multisig Propose
```

_See code: [src/commands/msig/propose.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/msig/propose.ts)_

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

Update Permission

```
USAGE
  $ proton permission ACCOUNT

ARGUMENTS
  ACCOUNT  Account to modify

DESCRIPTION
  Update Permission
```

_See code: [src/commands/permission/index.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/permission/index.ts)_

## `proton permission:link ACCOUNT PERMISSION CONTRACT [ACTION]`

Link Auth

```
USAGE
  $ proton permission:link ACCOUNT PERMISSION CONTRACT [ACTION] [-p <value>]

FLAGS
  -p, --permission=<value>  Permission to sign with (e.g. account@active)

DESCRIPTION
  Link Auth
```

_See code: [src/commands/permission/link.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/permission/link.ts)_

## `proton permission:unlink ACCOUNT CONTRACT [ACTION]`

Unlink Auth

```
USAGE
  $ proton permission:unlink ACCOUNT CONTRACT [ACTION] [-p <value>]

FLAGS
  -p, --permission=<value>

DESCRIPTION
  Unlink Auth
```

_See code: [src/commands/permission/unlink.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/permission/unlink.ts)_

## `proton psr URI`

Create Session

```
USAGE
  $ proton psr URI

DESCRIPTION
  Create Session
```

_See code: [src/commands/psr/index.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/psr/index.ts)_

## `proton ram`

List Ram price

```
USAGE
  $ proton ram

DESCRIPTION
  List Ram price
```

_See code: [src/commands/ram/index.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/ram/index.ts)_

## `proton ram:buy BUYER RECEIVER BYTES`

Buy RAM for an account

```
USAGE
  $ proton ram:buy BUYER RECEIVER BYTES [-p <value>]

ARGUMENTS
  BUYER     Account paying for RAM
  RECEIVER  Account receiving RAM
  BYTES     Number of bytes of RAM to purchase

FLAGS
  -p, --authorization=<value>  Authorization to use (e.g., account@active). Defaults to buyer@active

DESCRIPTION
  Buy RAM for an account

EXAMPLES
  $ proton ram:buy myaccount myaccount 10000

  $ proton ram:buy payer receiver 50000 -p payer@active
```

_See code: [src/commands/ram/buy.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/ram/buy.ts)_

## `proton rpc:accountsbyauthorizers AUTHORIZATIONS [KEYS]`

Get Accounts by Authorization

```
USAGE
  $ proton rpc:accountsbyauthorizers AUTHORIZATIONS [KEYS]

ARGUMENTS
  AUTHORIZATIONS  JSON-encoded list of {actor, permission} authorizations
  [KEYS]          JSON-encoded list of public keys

DESCRIPTION
  Get Accounts by Authorization
```

_See code: [src/commands/rpc/accountsbyauthorizers.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/rpc/accountsbyauthorizers.ts)_

## `proton scan ACCOUNT`

Open Account in Proton Scan

```
USAGE
  $ proton scan ACCOUNT

DESCRIPTION
  Open Account in Proton Scan
```

_See code: [src/commands/scan/index.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/scan/index.ts)_

## `proton table CONTRACT [TABLE] [SCOPE]`

Get Table Storage Rows

```
USAGE
  $ proton table CONTRACT [TABLE] [SCOPE] [-l <value>] [-u <value>] [-k <value>] [-r] [-p] [-c <value>] [-i
    <value>]

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

_See code: [src/commands/table/index.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/table/index.ts)_

## `proton transaction JSON`

Execute Transaction

```
USAGE
  $ proton transaction JSON

DESCRIPTION
  Execute Transaction
```

_See code: [src/commands/transaction/index.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/transaction/index.ts)_

## `proton transaction:get ID`

Get Transaction by Transaction ID

```
USAGE
  $ proton transaction:get ID

DESCRIPTION
  Get Transaction by Transaction ID
```

_See code: [src/commands/transaction/get.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/transaction/get.ts)_

## `proton transaction:push TRANSACTION`

Push Transaction

```
USAGE
  $ proton transaction:push TRANSACTION [-u <value>]

FLAGS
  -u, --endpoint=<value>  Your RPC endpoint

DESCRIPTION
  Push Transaction
```

_See code: [src/commands/transaction/push.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/transaction/push.ts)_

## `proton version`

Version of CLI

```
USAGE
  $ proton version

DESCRIPTION
  Version of CLI
```

_See code: [src/commands/version.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.1.98/src/commands/version.ts)_
<!-- commandsstop -->
