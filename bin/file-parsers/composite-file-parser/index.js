module.exports = class CompositeFileParser {
    constructor(options) {
        this.parsers = options.parsers;
    }

    async parse(file) {
        for (const parser of this.parsers) {
            await parser.parse(file);
        }
    }
}