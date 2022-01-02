const fs = require('fs').promises;
const path = require('path')

module.exports = class FileParser {
    constructor(options) {
        this.parsers = options.parsers;
        this.root = options.root;
    }

    async parse(file) {
        const root = relativeRoot(file, this.root);
            
        for (const parser of this.parsers) {
            const files = await parser.parse(file, root);
            await createFiles(files);
        }
    }
}

createFiles = async function (files) {
    if (files == undefined)
        return;
    
    for (const file of files) {
        await fs.writeFile(file.location, file.content);
    }
}

relativeRoot = function (file, root) {
    const relativeRoot = path.relative(path.parse(file).dir, root);
    
    if(relativeRoot.endsWith('..'))
        return `${relativeRoot}/`;
    else
        return relativeRoot;
}