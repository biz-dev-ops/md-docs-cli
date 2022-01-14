const chalk = require('chalk-next');
const path = require('path');
const { cwd } = require('process');
const files = require('../../files');


module.exports = class TestExecutionsStore {
    #data = null;

    constructor({ options }) {
        this.testExecutionLocation = options.testExecutionLocation;
    }

    async get() {
        if (this.#data != null)
            return this.#data;
        
        if (!await files.exists(this.testExecutionLocation)) {
            console.info();
            console.info(chalk.yellowBright(`test execution source ${this.testExecutionLocation} does not exsits, returning empty collection.`));
            this.#data = [];
            return this.#data;
        }

        const executions = [];

        console.info();
        console.info(chalk.yellow(`scanning ${this.testExecutionLocation} for test executions:`));

        await files.each(this.testExecutionLocation, async (file) => {
            if (!path.extname(file) !== '.json')
                return;
        
            console.info(chalk.green(`\t* adding test execution ${path.relative(this.testExecutionLocation, file)}`));

            const execution = JSON.parse(await files.readFileAsString(file));

            executions.push(execution);
        });

        this.#data = executions; 
        return this.#data;
    }
}