module.exports = class TestExecutionsParser {
    
    //TODO: create composite parser with Specflow and Cucumber implementations.
    constructor({ options, testExecutionStore }) {
        this.root = options.dst;
        this.testExecutionStore = testExecutionStore;
    }

    async get() {
        const executions = await this.testExecutionStore.get();
        if (executions?.specflow == undefined)
            return null;
        
        return executions.specflow.items;
    }
}