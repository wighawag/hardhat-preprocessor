import 'hardhat/types/config';
import 'hardhat/types/runtime';
import {ExampleHardhatRuntimeEnvironmentField} from './ExampleHardhatRuntimeEnvironmentField';

declare module 'hardhat/types/config' {
  // This is an example of an extension to one of the Hardhat config values.
  interface ProjectPaths {
    newPath?: string;
  }
}

declare module 'hardhat/types/runtime' {
  // This is an example of an extension to the Hardhat Runtime Environment.
  // This new field will be available in tasks' actions, scripts, and tests.
  interface HardhatRuntimeEnvironment {
    example: ExampleHardhatRuntimeEnvironmentField;
  }
}
