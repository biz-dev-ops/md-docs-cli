const fs = require('fs').promises;
const chalk = require('chalk-next');
const path = require('path');
const { env, cwd } = require('process');
const files = require('../files');


module.exports = class Menu {
    constructor(options) {
        this.target = options.target;
    }

    async items() {
        if (!await files.exists(this.target)) {
            throw new Error(`menu source ${path.relative(cwd(), this.target)}  not found.`);
        }

        console.info('');
        console.info(chalk.yellow(`scanning ${path.relative(cwd(), this.target)} for menu items:`));

        const items = [];

        const item = await this.#getMenuItems(this.target);
        if (items != undefined)
            items.push(item);

        if (env.NODE_ENV === 'development')
            await fs.writeFile(path.resolve(this.target, `menu.json`), JSON.stringify(items));

        return items;
    }


    #getMenuItems = async function (src) {
        await fs.access(src);
        const entries = await fs.readdir(src, { withFileTypes: true });

        const item = {
            name: this.#format(path.basename(src)),
            items: []
        };

        for (const entry of entries) {
            if (entry.isDirectory()) {
                var sub = await this.#getMenuItems(path.resolve(src, entry.name));
                if (sub != undefined)
                    item.items.push(sub);
            }
            else if (entry.name === 'index.md') {
                const file = path.relative(this.target, path.resolve(src, entry.name));
                console.info(chalk.green(`\t * adding menu item ${file}`));
                item.url = `${file.slice(0, -3)}.html`;
            }
        }

        if (item.url != undefined || item.items.length > 0)
            return item;
    }

    #format = function (name) {
        if (name === path.basename(this.target))
            return 'home';

        return name.charAt(0).toUpperCase() + name.slice(1)
            .replace("-", " ");
    }
}

