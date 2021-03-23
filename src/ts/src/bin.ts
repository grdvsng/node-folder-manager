/*
    main
*/
const fs   = require("fs");
const path = require("path");


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

    exists(src: string): boolean
    {
        let folderPath = this._checkFolder(src);

        return !!fs.existsSync(folderPath);
    }

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

    dir(src: string): string
    {
        return this._dir(src).join("\n");
    }

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


module.exports = {
    nfm:  new FolderManager(),
}