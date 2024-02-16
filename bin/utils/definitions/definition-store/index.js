const path = require('path');
const yaml = require('js-yaml');
const colors = require('colors');
const files = require('../../files');
const { defaultArgs } = require('puppeteer');

module.exports = class DefinitionStore {
    #data = null;

    constructor({ options, sitemap, markdownRenderer }) {
        this.options = options;
        this.sitemap = sitemap;
        this.markdownRenderer = markdownRenderer;
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
            }, [])
            .flatMap(definition => {
                const aliasses = [ definition.name ];
                
                if (definition.alias) {
                    aliasses.push(...definition.alias);
                }

                return aliasses.map(alias => { 
                    const newDef = Object.assign({}, definition, {name: alias});
                    delete newDef.alias;
                    return newDef;
                });
            })
            .map(definition => this.#linkToPage(definition, pages))
            .sort((a, b) => b.name.length - a.name.length || a.name.localeCompare(b.name));
    }

    async #parse(file) {
        console.info(colors.yellow(`\t\t * parsing ${file}`));

        const content = await files.readFileAsString(file);
        const definitions = yaml.load(content) || [];

        return await Promise.all(definitions.map(async definition => {
            definition.html = definition.text ? (await this.markdownRenderer.render(definition.text)).innerHTML : "";
            return definition;
        }));
    }

    #linkToPage(definition, pages) {
        if(definition.link) {
            return definition;
        }
        
        const link = pages.findFirst(definition.name)?.url;
        if(link) {
            definition.link = link;
        }

        return definition;
    }
}