"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = __importDefault(require("child_process"));
/**
 * This file should be compiled and the compiled js should be added to version control.
 * This script will copy files under the cloned tmp/ folder to current folder (should be
 * main repo folder). Then in order to prevent this change in git file tracking, it will
 * performing following action:
 *
 *  1. For files that doesn't exist on main repo, add the file path to ".git/info/exclude"
 *  2. For files that already exist on main repo, run "git update-index --skip-worktree"
 *
 * If we want to revert changes to make some actual edit on overwritten files, we can run
 * "npm run disable-env". It will launch "scripts/pipeline-env-disable.ts":
 *
 *  1. For not existed files, remove the file and clear ".git/info/exclude"
 *  2. For existed files, run "git update-index --no-skip-worktree"
 */
exports.pipelineIgnoreFiles = [
    '.git', '.gitignore', ".github",
    'CODE_OF_CONDUCT.md', 'README.md', 'SECURITY.md', "LICENSE"
];
const copyFiles = (srcPath, dstPath, newFileList, existFileList) => {
    console.log(`Overwriting pipeline file ${dstPath}`);
    if (!fs_1.default.lstatSync(srcPath).isDirectory()) {
        const fileExist = fs_1.default.existsSync(dstPath);
        fs_1.default.copyFileSync(srcPath, dstPath);
        if (fileExist) {
            existFileList.push(dstPath);
        }
        else {
            newFileList.push(dstPath);
        }
        return;
    }
    if (!fs_1.default.existsSync(dstPath)) {
        fs_1.default.mkdirSync(dstPath);
    }
    for (const fileName of fs_1.default.readdirSync(srcPath)) {
        if (exports.pipelineIgnoreFiles.includes(fileName)) {
            continue;
        }
        copyFiles(path_1.default.join(srcPath, fileName), path_1.default.join(dstPath, fileName), newFileList, existFileList);
    }
};
exports.removeFiles = (dstPath) => {
    if (!fs_1.default.lstatSync(dstPath).isDirectory()) {
        fs_1.default.unlinkSync(dstPath);
        return;
    }
    for (const fileName of fs_1.default.readdirSync(dstPath)) {
        exports.removeFiles(path_1.default.join(dstPath, fileName));
    }
    fs_1.default.rmdirSync(dstPath);
};
const main = () => {
    child_process_1.default.execSync('git config core.sparseCheckout true');
    const newFileList = [];
    let existFileList = [];
    copyFiles('tmp', '.', newFileList, existFileList);
    existFileList = existFileList.concat(newFileList);
    newFileList.push('');
    fs_1.default.appendFileSync('.git/info/exclude', newFileList.join('\n'));
    existFileList.forEach(filePath => {
        try {
            child_process_1.default.execSync(`git update-index --skip-worktree ${filePath}`);
        }
        catch (e) {
            // Pass
        }
    });
    existFileList = existFileList.map(filePath => `!${filePath}`);
    existFileList.unshift('/*');
    existFileList.push('');
    fs_1.default.writeFileSync('.git/info/sparse-checkout', existFileList.join('\n'));
    console.warn('If you encounter any error regarding above files, please run "npm run disable-env" and try again.');
    console.log('Launching "npm ci"');
    child_process_1.default.execSync('npm ci');
};
if (require.main === module) {
    main();
}
//# sourceMappingURL=pipeline-env-enable.js.map