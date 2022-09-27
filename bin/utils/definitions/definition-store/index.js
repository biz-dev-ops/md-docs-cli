const path = require('path');
const files = require('../../files');
const yaml = require('js-yaml');
const colors = require('colors');


module.exports = class DefinitionStore {
    #data = null;

    constructor({ options }) {
        this.options = options;
    }

    async init() {
        await this.get();
    }

    async get() {
        if (this.#data != null)
            return this.#data;

        console.info();

        this.#data = [];

        await files.each(this.options.dst, async (file) => {
            if (path.basename(file) !== "definitions.yml")
                return;

            console.info(colors.yellow(`\t* reading ${path.relative(this.options.dst, file)}`));

            const content = await files.readFileAsString(file);
            const definitions = yaml.load(content) || [];
            console.info(colors.yellow(`\t\t * ${definitions.length} definitions found, merging.`));

            this.#data = this.#data.concat(definitions);

        });

        this.#data = this.#data
            .reduce((target, item) => {
                const index = target.findIndex(p => p.name === item.name);

                if (index === -1)
                    target.push(item);
                else
                    target[index] = item;
                
                return target;
            }, []);
    }
}