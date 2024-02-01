const path = require('path');
const yaml = require('js-yaml');
const colors = require('colors');
const files = require('../../files');


module.exports = class DefinitionStore {
    #data = null;

    constructor({ options, sitemap }) {
        this.options = options;
        this.sitemap = sitemap;
    }

    async init() {
        await this.get();
        this.sitemap.init();
    }

    async get() {
        if (this.#data != null)
            return this.#data;

        console.info();

        const pages = await this.sitemap.items();
        this.#data = [];

        await files.each(this.options.dst, async (file) => {
            if (path.basename(file) !== "definitions.yml")
                return;

            console.info(colors.yellow(`\t* reading ${path.relative(this.options.dst, file)}`));
            const definitions = await this.#parse(file, pages);
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

    async #parse(file, pages) {
        const content = await files.readFileAsString(file);
        const definitions = yaml.load(content) || [];

        return await Promise.all(definitions.map(async definition => {
            if(definition.link) {
                return definition;
            }

            for(const name of [definition.name, ...(definition.alias || [])]) {
                const link = pages.findFirst(name)?.url;
                if(link) {
                    definition.link = link;
                    break;
                }
            }

            if(definition.link) {
                console.log(definition);
            }

            return definition;
        }));
    }
}