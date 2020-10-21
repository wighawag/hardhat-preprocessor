import {resetHardhatContext} from 'hardhat/plugins-testing';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import path from 'path';
import fs from 'fs-extra';

declare module 'mocha' {
  interface Context {
    env: HardhatRuntimeEnvironment;
  }
}

export function useEnvironment(
  fixtureProjectName: string,
  config?: {networkName?: string; clearCache?: boolean}
): void {
  config = config || {};
  // eslint-disable-next-line prefer-const
  let {networkName, clearCache} = config;
  if (!networkName) {
    networkName = 'localhost';
  }
  beforeEach('Loading hardhat environment', function () {
    process.chdir(path.join(__dirname, 'fixture-projects', fixtureProjectName));
    if (clearCache) {
      fs.emptyDirSync('cache');
    }
    process.env.HARDHAT_NETWORK = networkName;

    this.env = require('hardhat');
  });

  afterEach('Resetting hardhat', function () {
    resetHardhatContext();
  });
}
