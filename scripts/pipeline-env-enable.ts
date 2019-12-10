import fs from 'fs';
import path from 'path';
import childProcess from 'child_process';

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
  const newFileList: string[] = [''];
  copyFiles('tmp', '.', newFileList);
  fs.appendFileSync('.git/info/exclude', newFileList.join('\n'));

  console.log('Launching "npm ci"')
  childProcess.execSync('npm ci');
}

if (require.main === module) {
  main();
}
