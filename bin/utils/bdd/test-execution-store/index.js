const chalk = require('chalk-next');
const path = require('path');
const { env, cwd } = require('process');
const files = require('../../files');


module.exports = class TestExecutionsStore {
    constructor(options) {
        this.target = options.target;
    }

    async get() {
        if (!await files.exists(this.target)) {
            console.info('');
            console.log(chalk.yellowBright(`test execution source ${path.relative(cwd(), this.target)} does not exsits, returning empty collection.`));
            return [];
        }

        const executions = [];

        console.info('');
        console.info(chalk.yellow(`scanning ${path.relative(cwd(), this.target)} for test executions:`));

        await files.each(this.target, async (file) => {
            if (!path.extname(file) !== '.json')
                return;
        
            console.info(chalk.green(`\t* adding test execution ${path.relative(this.target, file)}`));

            const execution = JSON.parse(await files.readFileAsString(file));

            executions.push(execution);
        });

        return executions; 
    }
}