import 'hardhat/types/config';
import 'hardhat/types/runtime';
import 'hardhat/types/runtime';
import {HardhatRuntimeEnvironment} from 'hardhat/types';

declare module 'hardhat/types/config' {
  type LinePreprocessor = (line: string, sourceInfo: {absolutePath: string}) => string;

  interface HardhatUserConfig {
    preprocess?: {
      eachLine: (
        hre: HardhatRuntimeEnvironment
      ) => LinePreprocessor | Promise<LinePreprocessor | undefined> | undefined;
    };
  }

  interface HardhatConfig {
    preprocess?: {
      eachLine: (
        hre: HardhatRuntimeEnvironment
      ) => LinePreprocessor | Promise<LinePreprocessor | undefined> | undefined;
    };
  }
}
