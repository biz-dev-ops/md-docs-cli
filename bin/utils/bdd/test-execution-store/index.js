const chalk = require('chalk-next');
const fs = require('fs').promises;
const path = require('path');
const { env } = require('process');
const files = require('../../files');


module.exports = class TestExecutionsStore {
    #data = null;

    constructor({ options, gitInfo }) {
        this.root = options.dst;
        this.testExecutionLocation = path.resolve(options.testExecutionLocation, gitInfo.branch.name);
    }

    async get() {
        if (this.#data != null)
            return this.#data;
        
        if (!await files.exists(this.testExecutionLocation)) {
            console.info();
            console.info(chalk.yellowBright(`test execution source ${this.testExecutionLocation} does not exsits, returning empty collection.`));
            this.#data = {};
            return this.#data;
        }

        const executions = {};

        console.info();
        console.info(chalk.yellow(`scanning ${this.testExecutionLocation} for test executions:`));

        const directories = await getDirectories(this.testExecutionLocation);

        for (const directory of directories) {
            const type = path.basename(directory);
            executions[type] = {
                items: []
            };

            console.debug(chalk.yellow(`\t* execution type ${type} found:`));

            await files.each(directory, async (file) => {
                if (!file.endsWith('.json'))
                    return;
            
                console.info(chalk.green(`\t\t* adding test execution ${path.relative(directory, file)}`));
    
                const execution = JSON.parse(await files.readFileAsString(file));
    
                executions[type].items.push(execution);
            });
        }        

        this.#data = executions; 

        if (env.NODE_ENV === 'development')
            await fs.writeFile(path.resolve(this.root, 'test-execution.json'), JSON.stringify(this.#data));

        return this.#data;
    }
}

async function getDirectories(src) {
    const entries = await fs.readdir(src, { withFileTypes: true });
    return entries
        .filter(entry => entry.isDirectory())
        .map(entry => path.resolve(src, entry.name));
}