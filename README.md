[![hardhat](https://hardhat.org/hardhat-plugin-badge.svg?1)](https://hardhat.org)

# hardhat-preprocessor

_This plugin allows to pre-preocess contract source code before compilation_

[Hardhat](http://hardhat.org) preprocessor plugin.

## What

This plugin allow you to specify a function that is executed on every line of all contracts so that you can pre-process the code.

A typical example (included) is to remove console.log for production ready contracts.

Note that this plugin do not touch the filesystem. It happens in memory.

## Installation

```bash
npm install hardhat-preprocessor
```

And add the following statement to your `hardhat.config.js`:

```ts
import 'hardhat-preprocessor';
```

## Required plugins

Nothing required

## Tasks

No new tasks but it update the `compile` task.

## Environment extensions

No extra fields added to the envirobment.

## Configuration

This plugin extends the Hardhat Config with one new field: `preprocess`

This field is an object with a field : `eachLine` that itself is a function that accept the BRE as argument and must return either a function or a promise to a function.

That function exepect a string as argument (a line of a contract) and must return a string.

Note that instead of returning (or resolving a function), it is possible to return undefined to skip the preprocessing entirely.

Basic example that add a comment on each line:

```ts
import {removeConsoleLog} from 'hardhat-preprocessor';
export default {
  preprocess: {
    eachLine: {
      transform: (bre) => (line) => line + '// comment at the end of each line'
    }
  },
};
```

The plugin comes also with a preprocess function to remove `console.log` (achieving the same thing as this [plugin](https://github.com/ItsNickBarry/buidler-log-remover) but without changing the files )

You can use it as follow :

```ts
import {removeConsoleLog} from 'hardhat-preprocessor';
export default {
  preprocess: {
    eachLine: removeConsoleLog((bre) => bre.network.name !== 'hardhat' && bre.network.name !== 'localhost'),
  },
};
```

In this example the preprocessing do not happen when used against hardhat (testing) or localhost

## Usage

There are no additional steps you need to take for this plugin to work.
