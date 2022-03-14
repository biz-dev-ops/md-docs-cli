module.exports = class CompositeFileParser {
    constructor({ fileParsers }) {
        this.fileParsers = fileParsers;
    }

    async parse(file) {        
        for (const parser of this.fileParsers) {
            await parser.parse(file);
        }
    }
}