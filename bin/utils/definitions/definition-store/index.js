const files = require('../../files');
const yaml = require('js-yaml');
const chalk = require('chalk-next');


module.exports = class DefinitionStore {
    #data = null;

    constructor({ options }) {
        this.options = options;
    }

    async get() {
        if (this.#data != null)
            return this.#data;
        
        console.info();

        this.#data = [];
        if (!await files.exists(this.options.definitionsFile)) {
            console.info(chalk.yellow(`no defintion file found.`));
            return this.#data;
        }

        const content = await files.readFileAsString(this.options.definitionsFile);
        this.#data = yaml.load(content);
        console.info(chalk.yellow(`${this.#data.length} defintions found.`));
        return this.#data;
    }
}