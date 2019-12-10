"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = __importDefault(require("child_process"));
const _copySkipFiles = ['.git', '.gitignore'];
const copyFiles = (srcPath, dstPath, newFileList) => {
    console.log(`Overwriting pipeline file ${dstPath}`);
    if (!fs_1.default.lstatSync(srcPath).isDirectory()) {
        const fileExist = fs_1.default.existsSync(dstPath);
        fs_1.default.copyFileSync(srcPath, dstPath);
        if (fileExist) {
            child_process_1.default.execSync(`git update-index --assume-unchanged ${dstPath}`);
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
        if (_copySkipFiles.includes(fileName)) {
            continue;
        }
        copyFiles(path_1.default.join(srcPath, fileName), path_1.default.join(dstPath, fileName), newFileList);
    }
};
const removeFiles = (dstPath) => {
    if (!fs_1.default.lstatSync(dstPath).isDirectory()) {
        fs_1.default.unlinkSync(dstPath);
        return;
    }
    for (const fileName of fs_1.default.readdirSync(dstPath)) {
        removeFiles(path_1.default.join(dstPath, fileName));
    }
    fs_1.default.rmdirSync(dstPath);
};
const main = () => {
    const newFileList = [''];
    copyFiles('tmp', '.', newFileList);
    fs_1.default.appendFileSync('.git/info/exclude', newFileList.join('\n'));
    child_process_1.default.execSync('npm ci');
};
main();
//# sourceMappingURL=pipeline-env-enable.js.map