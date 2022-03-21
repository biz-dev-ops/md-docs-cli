const fs = require('fs').promises;
const chalk = require('chalk-next');
const path = require('path');
const { env, cwd } = require('process');
const files = require('../files');


module.exports = class Menu {
    #data = null;
    #regex = /\d+[_](.*)/;

    constructor({ options }) {
        this.root = options.dst;        
    }

    async init() {
        await this.items();
    }

    async items() {
        if (this.#data)
            return this.#data;
        
        this.#data = await this.#getData();
        return this.#data;
    }

    async #getData() {
        if (!await files.exists(this.root)) {
            throw new Error(`menu source ${path.relative(cwd(), this.root)}  not found.`);
        }

        console.info();
        console.info(chalk.yellow(`scanning ${this.root} for menu items:`));

        const items = [];

        const item = await this.#getMenuItem(this.root);
        if (item != undefined) {
            items.push(...item.items);
            item.items = [];
            items.unshift(item);
        }

        if (env.NODE_ENV === 'development')
            await fs.writeFile(path.resolve(this.root, `menu.json`), JSON.stringify(items));

        return items;
    }

    async #getMenuItem(src) {
        await fs.access(src);
        const entries = await fs.readdir(src, { withFileTypes: true });

        const item = {
            name: this.#format(src),
            items: []
        };

        for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
            if (entry.isDirectory()) {
                const name = await this.#resolveDirectory(entry, src);
                const sub = await this.#getMenuItem(path.resolve(src, name));
                if (sub != undefined)
                    item.items.push(sub);
            }
            else if (entry.name === 'index.md') {
                const file = path.relative(this.root, path.resolve(src, entry.name));
                console.info(chalk.green(`\t* adding menu item ${file}`));
                item.url = `${file.slice(0, -3)}.html`;
            }
        }

        if (item.url != undefined || item.items.length > 0)
            return item;
    }

    #format(src) {
        if (this.root === src)
            return 'home';
        
        const name = path.basename(src);

        return name.charAt(0).toUpperCase() + name.slice(1)
            .replace("-", " ");
    }

    async #resolveDirectory(entry, src) {

        const matches = entry.name.match(this.#regex);
        if (!matches)
            return entry.name;
        
        await fs.rename(path.resolve(src, matches[0]), path.resolve(src, matches[1]));
        return matches[1];
    }
}
