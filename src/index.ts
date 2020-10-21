import {extendEnvironment} from 'hardhat/config';
import {lazyObject} from 'hardhat/plugins';
import './type-extensions';

import {ExampleHardhatRuntimeEnvironmentField} from './ExampleHardhatRuntimeEnvironmentField';

extendEnvironment((env) => {
  // We add a field to the Hardhat Runtime Environment here.
  // We use lazyObject to avoid initializing things until they are actually
  // needed.
  env.example = lazyObject(() => new ExampleHardhatRuntimeEnvironmentField());
});
