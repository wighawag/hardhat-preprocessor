// We load the plugin here.
import {removeConsoleLog} from '../../../src/index';

import {HardhatRuntimeEnvironment, HardhatUserConfig} from 'hardhat/types';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.7.3',
    settings: {
      optimizer: {
        enabled: true,
        runs: 2000,
      },
    },
  },
  networks: {
    rinkeby: {
      url: 'http://localhost:8545',
    },
  },
  paths: {
    sources: 'src',
  },
  preprocess: {
    eachLine: removeConsoleLog(
      (hre: HardhatRuntimeEnvironment) => hre.network.name !== 'hardhat' && hre.network.name !== 'localhost'
    ),
  },
};

export default config;
