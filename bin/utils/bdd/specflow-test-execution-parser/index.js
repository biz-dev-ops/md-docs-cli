module.exports = class SpecflowTestExecutionParser {
    #executions = null;

    constructor({ testExecutionStore }) {
        this.testExecutionStore = testExecutionStore;
    }

    async results(feature) {
        await this.#init();

        return {
            parse: (scenario) =>  {

            }
        }
    }

    async #init() {
        if (this.#executions == null) {
            this.#executions = (await this.testExecutionStore.get()).specflow;
            if (this.#executions === null)
                this.#executions = {};
        }
    }
}