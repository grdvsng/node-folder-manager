/**
 * fs main module
 */
const fs   = require("fs");
/**
 * path main module
 */
const path = require("path");


/**
 * Main class(manage folders via this interface)
 */
class FolderManager
{
    constructor()
    {
        
    }

    private _checkFolder(src: string): string
    {
        if (!path.isAbsolute(src))
        {
            return path.resolve(src);
        }

        return src;
    }

    /** 
     * Create directory 
     * 
     * @param src - new folder destonition
     * @param replace - replace folder if exists 
     * ```javascript
     * import { nfm } from 'node-folder-manager'
     * nfm.create('./temp')
     * ```
    */
    create(src: string, replace: boolean = false): void
    {
        let folderPath = this._checkFolder(src);

        if (this.exists(folderPath) && !replace)
        {
            throw new Error(`folder '${folderPath}' allready exists!`);
        } else {
            if (replace)
                this.remove(folderPath);

            fs.mkdirSync(folderPath);
        }
    }

    /** 
     * Is directory exists
     * 
     * @param src - folder destonition
     * ```javascript
     * import { nfm } from 'node-folder-manager'
     * nfm.exists('./temp')
     * >> true
     * ```
    */
    exists(src: string): boolean
    {
        let folderPath = this._checkFolder(src);

        return !!fs.existsSync(folderPath);
    }

    /** 
     * Remove directory
     * 
     * @param src - folder destonition
     * ```javascript
     * import { nfm } from 'node-folder-manager'
     * nfm.remove('./temp')
     * ```
    */
    remove(src: string, recursive: boolean=true)
    {
        let folderPath = this._checkFolder(src);

        if (this.exists(folderPath))
        {
            fs.rmdirSync(folderPath, { recursive: recursive });
        }
    }

    private _dir(src: string, files: string[]=[], nesting: number=0): string[]
    {
        let folderPath = this._checkFolder(src);
        let ls         = fs.readdirSync(folderPath);

        for (let i=0; i < ls.length; i++)
        {
            let resolved: string = path.join(folderPath, ls[i]);

            if (fs.statSync(resolved).isDirectory())
            {
                files.push("\t".repeat(nesting) + resolved);
                this._dir(resolved, files, nesting+1);
            } else {
                files.push("\t".repeat(nesting) + resolved);
            }
        }

        return files;
    }

    /** 
     * Pretty dir tree 
     * 
     * @param src - folder destonition
     * ```javascript
     * import { nfm } from 'node-folder-manager'
     * nfm.dir('./temp')
     * >> ./temp
     * >>   /temp/test.js
     * ```
    */
    dir(src: string): string
    {
        return this._dir(src).join("\n");
    }

    /** 
     * dir tree 
     * 
     * @param src - folder destonition
     * ```javascript
     * import { nfm } from 'node-folder-manager'
     * nfm.glob('./temp')
     * [{ src: './temp/test.js', type: 'file' }, { src: './temp/test/', type: 'directory' }]
     * ```
    */
    glob(src: string, files: {[key: string]: string}[]=[]): {[key: string]: string}[]
    {
        let folderPath = this._checkFolder(src);
        let ls         = fs.readdirSync(folderPath);

        for (let i=0; i < ls.length; i++)
        {
            let resolved = path.join(folderPath, ls[i]);

            if (fs.statSync(resolved).isDirectory())
            {
                files.push({ src: resolved, type: 'directory' });
                this.glob(resolved, files);
            } else {
                files.push({ src: resolved, type: 'file' });
            }
        }

        return files;
    }

    private _copyFile(src: string, dest: string): Promise<string>
    {
        return new Promise( (resolve, reject) => {
            fs.copyFile(src, dest, err => {
                if (err) 
                {
                    reject(err);
                } else {
                    resolve(dest);
                }
            });
        });
    }

    /**
     * Copy folder
     * 
     * @param src       - source folder path
     * @param dest      - new destonition
     * @param recursive - copy all files and sub directory
      ```javascript
     * import { nfm } from 'node-folder-manager'
     * nfm.Copy('./temp', './test')
     * ```
    */
    copy(src: string, dest: string, recursive: boolean = true)
    {
        let folderSrc  = this._checkFolder(src);
        let folderDest = this._checkFolder(dest); 
        let ls         = fs.readdirSync(folderSrc);
        
        this.create(folderDest, true);

        if (recursive)
        {
            for (let i=0; i < ls.length; i++)
            {
                let resolved = path.join(folderSrc, ls[i]);
                let newDest  = path.join(folderDest, ls[i]);

                if (fs.statSync(resolved).isDirectory())
                {
                    this.copy(resolved, newDest, recursive);
                } else {
                    this._copyFile(resolved, newDest);
                }
            }
        }
    }
} 


/**
 * Instance of FolderManager
 */
module.exports = {
    nfm:  new FolderManager(),
}