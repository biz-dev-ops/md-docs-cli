module.exports = class TestExecutionsParser {
    
    constructor({ testExecutionParsers }) {
        this.testExecutionParsers = testExecutionParsers;
    }

    async parse(features) {
        for (const parser of this.testExecutionParsers) {
            await parser.parse(features);
        }
    }
}