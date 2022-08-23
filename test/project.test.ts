import {expect} from 'chai';
import {useEnvironment} from './helpers';
import fs from 'fs-extra';
import path from 'path';
import {HardhatRuntimeEnvironment} from 'hardhat/types';

function getSolcInput(env: HardhatRuntimeEnvironment, filepath: string, contractName: string) {
  const debugPath = path.join(env.config.paths.artifacts, filepath, contractName + '.dbg.json');
  const debugInfo = JSON.parse(fs.readFileSync(debugPath).toString());
  const buildInfoPath = path.join(path.dirname(debugPath), debugInfo.buildInfo);
  const buildInfo = JSON.parse(fs.readFileSync(buildInfoPath).toString());
  return buildInfo.input;
}

function getSource(env: HardhatRuntimeEnvironment, filepath: string, contractName: string) {
  const solcInput = getSolcInput(env, filepath, contractName);
  return solcInput.sources[filepath].content;
}

describe('Hardhat compile task', function () {
  useEnvironment('hardhat-project');

  it('It should not preprocess Test.sol', async function () {
    fs.emptyDirSync('cache');
    await this.env.run('compile');
    const source = getSource(this.env, 'src/Test.sol', 'Test');
    expect(source).to.equal(fs.readFileSync('src/Test.sol').toString());
  });

  it('It should not preprocess Test.sol', async function () {
    await this.env.run('compile');
    const source = getSource(this.env, 'src/Test.sol', 'Test');
    expect(source).to.equal(fs.readFileSync('src/Test.sol').toString());
  });
});

describe('Hardhat compile task on rinkeby', function () {
  useEnvironment('hardhat-project', {networkName: 'rinkeby'});
  it('It should preprocess Test.sol on rinkeby', async function () {
    fs.emptyDirSync('cache');
    await this.env.run('compile');
    const source = getSource(this.env, 'src/Test.sol', 'Test');
    expect(source).to.not.equal(fs.readFileSync('src/Test.sol').toString());
  });

  it('It should preprocess Test.sol on rinkeby', async function () {
    await this.env.run('compile');
    const source = getSource(this.env, 'src/Test.sol', 'Test');
    expect(source).to.not.equal(fs.readFileSync('src/Test.sol').toString());
  });
});

describe('Hardhat preprocess task on rinkeby', function () {
  useEnvironment('hardhat-project', {networkName: 'rinkeby'});
  it('It should preprocess Test.sol on rinkeby', async function () {
    const dest = 'dest';
    await this.env.run('preprocess', {dest});
    const source = fs.readFileSync(`${dest}/Test.sol`).toString();
    expect(source).to.not.equal(fs.readFileSync('src/Test.sol').toString());
  });

  it('It should preprocess only specific file on rinkeby', async function () {
    const dest = 'dest';
    await this.env.run('preprocess', {dest: dest, files: ["Test.sol"]});
    const source = fs.readFileSync(`${dest}/Test.sol`).toString();
    expect(source).to.not.equal(fs.readFileSync('src/Test.sol').toString());
  });
});

describe('Hardhat preprocess task on hardhat', function () {
  useEnvironment('hardhat-project', {networkName: 'hardhat'});
  it('It should preprocess Test.sol on hardhat', async function () {
    const dest = 'dest';
    await this.env.run('preprocess', {dest});
    const source = fs.readFileSync(`${dest}/Test.sol`).toString();
    expect(source).to.equal(fs.readFileSync('src/Test.sol').toString());
  });

  it('It should preprocess only specific file on hardhat', async function () {
    const dest = 'dest';
    await this.env.run('preprocess', {dest: dest, files: ["Test.sol"]});
    const source = fs.readFileSync(`${dest}/Test.sol`).toString();
    expect(source).to.equal(fs.readFileSync('src/Test.sol').toString());
  });
});

describe('Hardhat compile task with comments', function () {
  useEnvironment('hardhat-project-2', {networkName: 'hardhat'});

  it('It should preprocess Test.sol', async function () {
    fs.emptyDirSync('cache');
    await this.env.run('compile');
    const source = getSource(this.env, 'src/Test.sol', 'Test');
    expect(source).to.not.equal(fs.readFileSync('src/Test.sol').toString());
  });

  it('It should preprocess Test.sol 2', async function () {
    await this.env.run('compile');
    const source = getSource(this.env, 'src/Test.sol', 'Test');
    expect(source).to.not.equal(fs.readFileSync('src/Test.sol').toString());
  });
});

describe('Test virtual imports', function () {
  useEnvironment('hardhat-project-3', {networkName: 'hardhat'});

  it('It should preprocess Test.sol', async function () {
    fs.emptyDirSync('cache');
    await this.env.run('compile');
    const source = getSource(this.env, 'src/Test.sol', 'Test');
    expect(source).to.not.equal(fs.readFileSync('src/Test.sol').toString());
  });
});
