module.exports = class FileParser {
    constructor(options) {
        this.parsers = options.parsers;
    }

    async parse(file) {
        for (const parser of this.parsers) {
            await parser.parse(file);
        }
    }
}

// relativeRoot = function (file, root) {
//     const relativeRoot = path.relative(path.parse(file).dir, root);
    
//     if(relativeRoot.endsWith('..'))
//         return `${relativeRoot}/`;
//     else
//         return relativeRoot;
// }