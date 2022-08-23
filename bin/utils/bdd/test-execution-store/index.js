const colors = require('colors');
const fs = require('fs').promises;
const path = require('path');
const { env } = require('process');
const files = require('../../files');

module.exports = class TestExecutionsStore {
    #data = null;

    constructor({ options, gitInfo }) {
        this.root = options.dst;
        this.gitInfo = gitInfo;
        this.testExecutionLocation = options.testExecutionLocation;
    }

    async init() {
        await this.get();
    }

    async get() {
        if (this.#data != null)
            return this.#data;
        
        this.#data = await get(path.resolve(this.testExecutionLocation, this.gitInfo.branch.name));
        
        if (this.#data === null && this.gitInfo.branch.feature) {            
            console.info(colors.brightYellow(`feature branch executions not found, falling back to default branch executions.`));
            this.#data = await get(path.resolve(this.testExecutionLocation, this.gitInfo.branches.find(b => b.feature === false).name));
        }

        if (this.#data === null) {
            this.#data = {};
        }

        if (env.NODE_ENV === 'development')
            await fs.writeFile(path.resolve(this.root, 'test-execution.json'), JSON.stringify(this.#data));

        return this.#data;
    }
}

async function get(location) {
    if (!await files.exists(location)) {
        console.info();
        console.info(colors.brightYellow(`test execution source ${location} does not exsits.`));
        return null;
    }

    const executions = {};

    console.info();
    console.info(colors.yellow(`scanning ${location} for test executions:`));

    const directories = await getDirectories(location);

    for (const directory of directories) {
        const type = path.basename(directory);
        executions[type] = {
            items: []
        };

        console.debug(colors.yellow(`\t* execution type ${type} found:`));

        await files.each(directory, async (file) => {
            if (!file.endsWith('.json'))
                return;
        
            console.info(colors.green(`\t\t* adding test execution ${path.relative(directory, file)}`));

            const execution = JSON.parse(await files.readFileAsString(file));

            executions[type].items.push(execution);
        });
    }

    return executions;
}

async function getDirectories(src) {
    const entries = await fs.readdir(src, { withFileTypes: true });
    return entries
        .filter(entry => entry.isDirectory())
        .map(entry => path.resolve(src, entry.name));
}