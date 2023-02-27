module.exports = class CucumberTestExecutionParser {
    #executions = null;

    constructor({ testExecutionStore }) {
        this.testExecutionStore = testExecutionStore;
    }

    async parse(features) {
        await this.#init();
    }

    async #init() {
        if (this.#executions == null) {
            this.#executions = (await this.testExecutionStore.get()).specflow;
            if (this.#executions === null)
                this.#executions = {};
        }
    }
}