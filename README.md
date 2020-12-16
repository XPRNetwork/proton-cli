@protonprotocol/cli
===================

Proton CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@protonprotocol/cli.svg)](https://npmjs.org/package/@protonprotocol/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@protonprotocol/cli.svg)](https://npmjs.org/package/@protonprotocol/cli)
[![License](https://img.shields.io/npm/l/@protonprotocol/cli.svg)](https://github.com/ProtonProtocol/proton-cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @protonprotocol/cli
$ proton COMMAND
running command...
$ proton (-v|--version|version)
@protonprotocol/cli/0.3.0 darwin-x64 node-v12.19.0
$ proton --help [COMMAND]
USAGE
  $ proton COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`proton bootstrap [FOLDER]`](#proton-bootstrap-folder)
* [`proton hello [FILE]`](#proton-hello-file)
* [`proton help [COMMAND]`](#proton-help-command)

## `proton bootstrap [FOLDER]`

describe the command here

```
USAGE
  $ proton bootstrap [FOLDER]

OPTIONS
  -h, --help       show CLI help
  -n, --name=name  name of folder to copy boilerplate to
```

_See code: [src/commands/bootstrap.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.3.0/src/commands/bootstrap.ts)_

## `proton hello [FILE]`

describe the command here

```
USAGE
  $ proton hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ proton hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/ProtonProtocol/proton-cli/blob/v0.3.0/src/commands/hello.ts)_

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
<!-- commandsstop -->
