const path = require('path')

module.exports = class FileParser {
    constructor(options) {
        this.parsers = options.parsers;
        this.root = options.root;
    }

    async parse(file) {
        const root = relativeRoot(file, this.root);
            
        for (const parser of this.parsers) {
            await parser.parse(file, root);
        }
    }
}

relativeRoot = function (file, root) {
    const relativeRoot = path.relative(path.parse(file).dir, root);
    
    if(relativeRoot.endsWith('..'))
        return `${relativeRoot}/`;
    else
        return relativeRoot;
}