const fs = require('fs').promises;
const { cwd } = require('process');
const path = require('path');
const colors = require('colors');
const yaml = require('js-yaml');
const files = require('../../utils//files')

module.exports = class BusinessReferenceArchitectureFileParser {
    constructor({ options, sitemap }) {
        this.options = options;
        this.sitemap = sitemap;
    }

    async parse(file) {
        if (!(file.endsWith('business-reference-architecture.yml') || file.endsWith('business-reference-architecture.yaml')))
            return;

        console.info(colors.green(`\t\t\t\t* parsing yaml`));
        const json = await this.#getJson(file);
        await this.#dereference(json);
        
        await fs.writeFile(`${file}.json`, JSON.stringify(json));
    }
        
        
    async #dereference(el) {
        if (!el) {
            return;
        }
    
        if (Array.isArray(el)) {
            await Promise.all(el.map(item => this.#dereference(item)));
            return;
        }
    
        if (typeof el === 'object') {
            for (const [key, value] of Object.entries(el)) {
                if (!["groups", "buttons"].includes(key) || typeof value !== "string") {
                    await this.#dereference(value);
                }
                else {
                    const page = await this.#findPage(value);

                    if(!el.icon) {
                        el.icon = page.meta?.icon;
                    }

                    if(!el.title) {
                        el.title = page.name;
                    }

                    if(!el.link) {
                        el.link = page.url;
                    }

                    el[key] = await (key === "groups" ? this.#parseGroups(page) : this.#parseButtons(page));
                }
            }
            return;
        }
    }
        
    async #parseGroups(page) {
        if(!page.items)
            return [];

        return await Promise.all(
            page.items.map(async (child) => {
                const group = {
                    title: child.name,
                    link: child.url,
                    icon: child.meta?.icon,
                    buttons: await this.#parseButtons(child)
                };
                return group;
            })
        );
    }
        
    async #parseButtons(page) {
        if(!page.items)
            return [];

        return await Promise.all(
            page.items.map(async (child) => {
                const button = {
                    title: child.name,
                    link: child.url,
                    icon: child.meta?.icon
                };
                return button;
            })
        );
    }

    async #findPage(ref) {
        const relativePath = path.relative(this.options.dst, path.resolve(cwd(), ref));

        const items = await this.sitemap.items();
        const page = items.findFirst((el) => el.path === relativePath);

        if (await !page) {
            throw `Path does not exist. ${relativePath}`;
        }

        return page;
    }

    async #getJson(file) {
        const content = await files.readFileAsString(file);
        const json = yaml.load(content);
        return json;
    }
}