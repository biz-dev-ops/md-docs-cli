const fs = require('fs').promises;
const colors = require('colors');
const path = require('path');
const { env, cwd } = require('process');
const files = require('../files');


module.exports = class Menu {
    #data = null;
    #regex = /(\d+[_])/ig;

    constructor({ options }) {
        this.root = options.dst;
    }

    async init() {
        this.#data = await this.#getData();
    }

    async items(currentUrl) {
        if (!this.#data)
            this.#data = await this.#getData();

        const urls = this.#rewriteUrls(this.#data, currentUrl);

        return urls;
    }

    async #getData() {
        if (!await files.exists(this.root)) {
            throw new Error(`menu source ${path.relative(cwd(), this.root)}  not found.`);
        }

        console.info();
        console.info(colors.yellow(`scanning ${this.root} for menu items:`));

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
            path: path.relative(this.root, src),
            classes: [],
            items: []
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
                item.url = `${file.slice(0, -3)}.html`;
            }
        }

        if (item.url != undefined || item.items.length > 0)
            return item;
    }

    #format(src) {
        if (this.root === src)
            return 'Home';

        const name = this.#rewriteName(path.basename(src));

        return name.charAt(0).toUpperCase() + name.slice(1)
            .replaceAll("-", " ");
    }

    #rewriteUrls(items, currentUrl) {
        return items
            .map(i => {
                const item = {
                    name: i.name,
                    classes: [],
                    items: this.#rewriteUrls(i.items, currentUrl)
                }

                if (i.url === currentUrl) {
                    item.classes.push("active");
                }
                else if (currentUrl.startsWith(i.path)) {
                    item.classes.push("active-child");
                }

                if (i.url) {
                    item.url = this.#rewriteUrl(i.url);
                }

                if (i.items.length) {
                    item.classes.push("has-sibbling");
                }

                return item;

            })
            .map((item, index, items) => {
                if (item.classes.some(c => c.startsWith('active')))
                    return item;
                
                if (items.some(i => i.classes.some(c => c.startsWith('active')))) {
                    item.classes.push('active-sibbling');
                }

                return item;
            });
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
