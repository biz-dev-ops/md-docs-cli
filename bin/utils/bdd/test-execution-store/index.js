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
        
        if (this.#data == null && !this.gitInfo.branch.mainBranch) {            
            console.info(colors.yellow(`feature branch executions not found, falling back to default branch executions.`));
            this.#data = await get(path.resolve(this.testExecutionLocation, this.gitInfo.branches.find(b => b.mainBranch === true).name));
        }

        if (env.NODE_ENV === 'development')
            await fs.writeFile(path.resolve(this.root, 'test-execution.json'), JSON.stringify(this.#data));
        
        if(this.#data == null)
            this.#data = [];

        return this.#data;
    }
}

async function get(location) {
    if (!await files.exists(location)) {
        console.info();
        console.info(colors.yellow(`test execution source ${location} does not exsits.`));
        return null;
    }

    const executions = [];

    console.info();
    console.info(colors.yellow(`scanning ${location} for test executions:`));

    const entries = await fs.readdir(location, { withFileTypes: true });

    for (let entry of entries) {
        const file = path.resolve(location, entry.name);

        if (entry.isDirectory()) {
            executions.push(...await get(file));
        }
        else if(entry.name.endsWith('.json')){
            console.info(colors.green(`\t\t* adding test execution ${entry.name}`));

            const execution = JSON.parse(await files.readFileAsString(file));
        
            executions.push(execution);
        }
    }

    return executions;
}