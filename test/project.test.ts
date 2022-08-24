import {expect} from 'chai';
import {useEnvironment} from './helpers';
import fs from 'fs-extra';
import path from 'path';
import {HardhatRuntimeEnvironment} from 'hardhat/types';

const dest = 'dest';

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
    await this.env.run('preprocess', {dest});
    const source = fs.readFileSync(`${dest}/Test.sol`).toString();
    expect(source).to.not.equal(fs.readFileSync('src/Test.sol').toString());
  });
});

describe('Hardhat preprocess task on hardhat', function () {
  useEnvironment('hardhat-project', {networkName: 'hardhat'});
  it('It should preprocess Test.sol on hardhat', async function () {
    await this.env.run('preprocess', {dest});
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

describe('Test virtual imports and name change', function () {
  useEnvironment('hardhat-project-3', {networkName: 'hardhat', clearCache: true});

  it('It should preprocess Test and Lib.sol', async function () {
    await this.env.run('compile');
    const newTestContract = getSource(this.env, 'src/Test.sol', 'Test');
    expect(newTestContract).to.not.equal(fs.readFileSync('src/Test.sol').toString());
    const newLibContract = getSource(this.env, 'src/Lib.sol', 'Lib');
    expect(newLibContract).to.not.equal(fs.readFileSync('src/Lib.sol').toString());
  });
});

describe('Preprocess specific files only', function () {
  useEnvironment('hardhat-project-3', {networkName: 'hardhat', clearCache: true});
  it('It should preprocess only specific file on hardhat', async function () {
    await this.env.run('preprocess', {dest: dest, files: "Test.sol"});
    // Test.sol should be preprocessed but not Lib.sol
    const newTestContract = fs.readFileSync(`${dest}/Test.sol`).toString();
    expect(newTestContract).to.not.equal(fs.readFileSync('src/Test.sol').toString());
    // Only 1 file preprocessed, so number of files in dest should be 1
    expect(fs.readdirSync(dest)).to.have.lengthOf(1);
  });

  it("test glob - only for nested folder", async function () {
    await this.env.run('preprocess', {dest: dest, files: '*/*.sol'});
    // Only Test2.sol should be preprocessed
    const newTest2Contract = fs.readFileSync(`${dest}/nested_folder/Test2.sol`).toString();
    expect(newTest2Contract).to.not.equal(fs.readFileSync('src/nested_folder/Test2.sol').toString());
    // Only 1 file preprocessed, so number of files in dest should be 1
    expect(fs.readdirSync(dest)).to.have.lengthOf(1);
  })

  it("test glob - only for parent folder", async function () {
    await this.env.run('compile');
    await this.env.run('preprocess', {dest: dest, files: '*.sol'});
    // Only Test and Lib.sol should be preprocessed
    const newTestContract = getSource(this.env, 'src/Test.sol', 'Test');
    expect(newTestContract).to.not.equal(fs.readFileSync('src/Test.sol').toString());
    const newLibContract = getSource(this.env, 'src/Lib.sol', 'Lib');
    expect(newLibContract).to.not.equal(fs.readFileSync('src/Lib.sol').toString());
    // Only 2 file preprocessed
    expect(fs.readdirSync(dest)).to.have.lengthOf(2);
  })
})