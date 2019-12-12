import fs from 'fs';
import path from 'path';
import childProcess from 'child_process';
import { removeFiles, pipelineIgnoreFiles } from './pipeline-env-enable';

/**
 * See "pipeline-env-enable.ts" for document.
 */

const removePipelineFile = (srcPath: string, dstPath: string) => {
  console.log(`Resetting pipeline file ${dstPath}`);

  if (!fs.lstatSync(srcPath).isDirectory()) {
    try {
      // For file that already exist in index
      childProcess.execSync(`git update-index --no-skip-worktree ${dstPath}`, {
        stdio: "ignore"
      });
      childProcess.execSync(`git checkout HEAD ${dstPath}`);
    } catch (e) {
      // For file that doesn't exist in index
      if (fs.existsSync(dstPath)) {
        fs.unlinkSync(dstPath);
      }
    }
    return;
  }

  for (const fileName of fs.readdirSync(srcPath)) {
    if (pipelineIgnoreFiles.includes(fileName)) {
      continue;
    }
    removePipelineFile(path.join(srcPath, fileName), path.join(dstPath, fileName));
  }
}

const main = () => {
  fs.writeFileSync('.git/info/exclude', '');
  removePipelineFile('tmp', '.');
  removeFiles('tmp');
};

if (require.main === module) {
  main();
}
