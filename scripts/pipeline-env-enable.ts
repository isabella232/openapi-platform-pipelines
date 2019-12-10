import fs from 'fs';
import path from 'path';
import childProcess from 'child_process';

/**
 * This file should be compiled and the compiled js should be added to version control.
 * This script will copy files under the cloned tmp/ folder to current folder (should be
 * main repo folder). Then in order to prevent this change in git file tracking, it will
 * performing following action:
 * 
 *  1. For files that doesn't exist on main repo, add the file path to ".git/info/exclude"
 *  2. For files that already exist on main repo, run "git update-index --assume-unchanged"
 * 
 * If we want to revert changes to make some actual edit on overwritten files, we can run
 * "npm run disable-env". It will launch "scripts/pipeline-env-disable.ts":
 * 
 *  1. For not existed files, remove the file and clear ".git/info/exclude"
 *  2. For existed files, run "git update-index --no-assume-unchanged"
 */

export const pipelineIgnoreFiles = ['.git', '.gitignore'];
const copyFiles = (srcPath: string, dstPath: string, newFileList: string[]) => {
  console.log(`Overwriting pipeline file ${dstPath}`);

  if (!fs.lstatSync(srcPath).isDirectory()) {
    const fileExist = fs.existsSync(dstPath);
    fs.copyFileSync(srcPath, dstPath);
    if (fileExist) {
      try {
        childProcess.execSync(`git update-index --assume-unchanged ${dstPath}`);
      } catch (e) {
        // Ignore error
      }
    } else {
      newFileList.push(dstPath);
    }
    return;
  }

  if (!fs.existsSync(dstPath)) {
    fs.mkdirSync(dstPath);
  }
  for (const fileName of fs.readdirSync(srcPath)) {
    if (pipelineIgnoreFiles.includes(fileName)) {
      continue;
    }
    copyFiles(path.join(srcPath, fileName), path.join(dstPath, fileName), newFileList);
  }
}

export const removeFiles = (dstPath: string) => {
  if (!fs.lstatSync(dstPath).isDirectory()) {
    fs.unlinkSync(dstPath);
    return;
  }

  for (const fileName of fs.readdirSync(dstPath)) {
    removeFiles(path.join(dstPath, fileName));
  }
  fs.rmdirSync(dstPath);
}

const main = () => {
  const newFileList: string[] = [];
  copyFiles('tmp', '.', newFileList);
  newFileList.push('');
  fs.appendFileSync('.git/info/exclude', newFileList.join('\n'));

  console.log('Launching "npm ci"')
  childProcess.execSync('npm ci');
}

if (require.main === module) {
  main();
}
