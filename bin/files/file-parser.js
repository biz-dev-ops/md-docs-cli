const fs = require('fs').promises;

module.exports = class FileParser {
    constructor(options) {
        this.parsers = options.parsers;
    }

    async parse(file) {
        const root = (() => { throw 'not implemented'; }) ();
            
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