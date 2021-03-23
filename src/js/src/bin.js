var fs = require("fs");
var path = require("path");
var FolderManager = (function () {
    function FolderManager() {
    }
    FolderManager.prototype._checkFolder = function (src) {
        if (!path.isAbsolute(src)) {
            return path.resolve(src);
        }
        return src;
    };
    FolderManager.prototype.create = function (src, replace) {
        if (replace === void 0) { replace = false; }
        var folderPath = this._checkFolder(src);
        if (this.exists(folderPath) && !replace) {
            throw new Error("folder '" + folderPath + "' allready exists!");
        }
        else {
            if (replace)
                this.remove(folderPath);
            fs.mkdirSync(folderPath);
        }
    };
    FolderManager.prototype.exists = function (src) {
        var folderPath = this._checkFolder(src);
        return !!fs.existsSync(folderPath);
    };
    FolderManager.prototype.remove = function (src, recursive) {
        if (recursive === void 0) { recursive = true; }
        var folderPath = this._checkFolder(src);
        if (this.exists(folderPath)) {
            fs.rmdirSync(folderPath, { recursive: recursive });
        }
    };
    FolderManager.prototype._dir = function (src, files, nesting) {
        if (files === void 0) { files = []; }
        if (nesting === void 0) { nesting = 0; }
        var folderPath = this._checkFolder(src);
        var ls = fs.readdirSync(folderPath);
        for (var i = 0; i < ls.length; i++) {
            var resolved = path.join(folderPath, ls[i]);
            if (fs.statSync(resolved).isDirectory()) {
                files.push("\t".repeat(nesting) + resolved);
                this._dir(resolved, files, nesting + 1);
            }
            else {
                files.push("\t".repeat(nesting) + resolved);
            }
        }
        return files;
    };
    FolderManager.prototype.dir = function (src) {
        return this._dir(src).join("\n");
    };
    FolderManager.prototype.glob = function (src, files) {
        if (files === void 0) { files = []; }
        var folderPath = this._checkFolder(src);
        var ls = fs.readdirSync(folderPath);
        for (var i = 0; i < ls.length; i++) {
            var resolved = path.join(folderPath, ls[i]);
            if (fs.statSync(resolved).isDirectory()) {
                files.push({ src: resolved, type: 'directory' });
                this.glob(resolved, files);
            }
            else {
                files.push({ src: resolved, type: 'file' });
            }
        }
        return files;
    };
    FolderManager.prototype._copyFile = function (src, dest) {
        return new Promise(function (resolve, reject) {
            fs.copyFile(src, dest, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(dest);
                }
            });
        });
    };
    FolderManager.prototype.copy = function (src, dest, recursive) {
        if (recursive === void 0) { recursive = true; }
        var folderSrc = this._checkFolder(src);
        var folderDest = this._checkFolder(dest);
        var ls = fs.readdirSync(folderSrc);
        this.create(folderDest, true);
        if (recursive) {
            for (var i = 0; i < ls.length; i++) {
                var resolved = path.join(folderSrc, ls[i]);
                var newDest = path.join(folderDest, ls[i]);
                if (fs.statSync(resolved).isDirectory()) {
                    this.copy(resolved, newDest, recursive);
                }
                else {
                    this._copyFile(resolved, newDest);
                }
            }
        }
    };
    return FolderManager;
}());
module.exports = {
    nfm: new FolderManager(),
};
//# sourceMappingURL=bin.js.map