// We load the plugin here.
import '../../../src/index';

import {HardhatUserConfig, LinePreprocessorConfig} from 'hardhat/types';

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
    eachLine: (): LinePreprocessorConfig => ({
      transform: (line) => line + '// comment at the end of each line',
      settings: {comment: true}, // ensure the cache is working, in that example it can be anything as there is no option, the preprocessing happen all the time
    }),
  },
};

export default config;
