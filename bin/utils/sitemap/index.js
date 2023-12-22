const fs = require('fs').promises;
const colors = require('colors');
const path = require('path');
const { env, cwd } = require('process');
const files = require('../files');

function SitemapArray() {
    this.find = function(path) {
        let found = null;

        this.every(element => {
            if(element.path === path) {
                found = element;
            }
            else {
                found = element.items.find(path);
            }

            if(found)
                return false;

            return true;
        });

        return found;
    }
}

SitemapArray.prototype = [];

module.exports = class Sitemap {
    #data = null;
    #regex = /(\d+[_])/ig;

    constructor({ options, relative }) {
        this.root = options.dst;
        this.relative = relative;
    }

    async init() {
        this.#data = await this.#getData();
    }

    async items() {
        if (!this.#data)
            this.#data = await this.#getData();

        return this.#data;
    }

    async #getData() {
        if (!await files.exists(this.root)) {
            throw new Error(`menu source ${path.relative(cwd(), this.root)}  not found.`);
        }

        console.info();
        console.info(colors.yellow(`scanning ${this.root} for menu items:`));

        const items = new SitemapArray();

        const item = await this.#getMenuItem(this.root);
        if (item != undefined) {
            items.push(...item.items);
            item.items = new SitemapArray();
            items.unshift(item);
        }

        if (env.NODE_ENV === 'development')
            await fs.writeFile(path.resolve(this.root, `stitemap.json`), JSON.stringify(items));

        return items;
    }

    async #getMenuItem(src) {
        await fs.access(src);
        const entries = await fs.readdir(src, { withFileTypes: true });

        const item = {
            name: this.#format(src),
            path: path.relative(this.root, src),
            items: new SitemapArray()
        };

        for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
            if (entry.isDirectory()) {
                const sub = await this.#getMenuItem(path.resolve(src, entry.name));
                if (sub != undefined)
                    item.items.push(sub);
            }
            else if (entry.name === 'index.md') {
                const file = path.relative(this.root, path.resolve(src, entry.name));
                console.info(colors.green(`\t* adding menu item ${file}`));
                item.url = this.#rewriteUrl(`${file.slice(0, -3)}.html`);
            }
        }

        return item;
    }

    #format(src) {
        if (this.root === src)
            return 'Home';

        const name = this.#rewriteName(path.basename(src));

        return name
            .charAt(0).toUpperCase() + name.slice(1)
            .replaceAll("-", " ");
    }

    #rewriteName(name) {
        return name.replaceAll(this.#regex, '');
    }

    #rewriteUrl(url) {
        const rewrite = url.replaceAll(this.#regex, '');
        if (rewrite === url)
            return url;

        console.info(colors.green(`\t* rewrite url ${url} => ${rewrite}`));
        return rewrite;
    }

}