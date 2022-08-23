// We load the plugin here.
import '../../../src/index';
import {HardhatUserConfig} from 'hardhat/types';

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
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    eachLine: () => ({transform: (line) => line.replace('asdf', 'Lib')}),
  },
};

export default config;
