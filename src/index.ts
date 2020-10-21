import './type-extensions';
import {internalTask, extendConfig} from 'hardhat/config';
import * as taskTypes from 'hardhat/types/builtin-tasks';
import {TASK_COMPILE_SOLIDITY_GET_COMPILATION_JOB_FOR_FILE} from 'hardhat/builtin-tasks/task-names';
import {
  CompilationJob,
  CompilationJobCreationError,
  HardhatConfig,
  HardhatRuntimeEnvironment,
  HardhatUserConfig,
  LinePreprocessor,
} from 'hardhat/types';
import {SolidityFilesCache} from 'hardhat/builtin-tasks/utils/solidity-files-cache';

extendConfig((config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
  if (userConfig.preprocess) {
    config.preprocess = userConfig.preprocess;
  }
});
// regex copied from https://github.com/ItsNickBarry/buidler-log-remover
const importsRegex = /\n?(\s*)?import\s*['"]hardhat\/console.sol['"]\s*;/g;
const callsRegex = /\n?(\s*)?console\s*\.\s*log\s*\([^;]*\)\s*;/g;

export function removeConsoleLog(
  condition?: (hre: HardhatRuntimeEnvironment) => boolean | Promise<boolean>
): (hre: HardhatRuntimeEnvironment) => Promise<LinePreprocessor | undefined> {
  const preprocess = (line: string, sourceInfo: {absolutePath: string}): string => {
    return line.replace(importsRegex, '').replace(callsRegex, '');
  };
  return async (hre: HardhatRuntimeEnvironment): Promise<LinePreprocessor | undefined> => {
    if (typeof condition === 'function') {
      const cond = condition(hre);
      const promise = cond as Promise<boolean>;
      if (typeof cond === 'object' && 'then' in promise) {
        return promise.then((v) => (v ? preprocess : undefined));
      } else if (!cond) {
        return Promise.resolve(undefined);
      }
    }
    return Promise.resolve(preprocess);
  };
}

// TODO task to write to disk : specific folder or overwrite
// can be used by library to export on npm package

let _linePreprocessor: LinePreprocessor | undefined | null;
async function getLinePreprocessor(hre: HardhatRuntimeEnvironment): Promise<LinePreprocessor | null> {
  if (_linePreprocessor !== undefined) {
    return _linePreprocessor;
  }
  const _getLinePreprocessor = hre.config.preprocess?.eachLine;
  if (_getLinePreprocessor) {
    const linePreProcessorPromise = _getLinePreprocessor(hre);
    if (typeof linePreProcessorPromise === 'object' && 'then' in linePreProcessorPromise) {
      _linePreprocessor = await linePreProcessorPromise;
    } else {
      _linePreprocessor = linePreProcessorPromise;
    }
  }
  return _linePreprocessor || null;
}

internalTask(TASK_COMPILE_SOLIDITY_GET_COMPILATION_JOB_FOR_FILE).setAction(
  async (
    {
      dependencyGraph,
      file,
    }: {
      dependencyGraph: taskTypes.DependencyGraph;
      file: taskTypes.ResolvedFile;
      solidityFilesCache?: SolidityFilesCache;
    },
    hre,
    runSuper
  ): Promise<CompilationJob | CompilationJobCreationError> => {
    const linePreProcessor = await getLinePreprocessor(hre);
    if (linePreProcessor) {
      file.content.rawContent = file.content.rawContent
        .split(/\r?\n/)
        .map((line) => {
          const newLine = linePreProcessor(line, {absolutePath: file.absolutePath});
          if (newLine.split(/\r?\n/).length > 1) {
            // prevent lines generated to create more line, this ensure preservation of line number while debugging
            throw new Error(`Line processor cannot create new lines. This ensures that line numbers are preserved`);
          }
          return newLine;
        })
        .join('\n');
    }
    return runSuper({dependencyGraph, file});
  }
);
