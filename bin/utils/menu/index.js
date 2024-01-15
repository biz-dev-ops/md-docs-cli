const path = require('path');

module.exports = class Menu {
    constructor({ sitemap, relative, options }) {
        this.sitemap = sitemap;
        this.relative = relative;
        this.options = options;
    }

    async items(currentUrl) {
        const currentPath = path.relative(this.options.dst, path.dirname(currentUrl));
        const urls = this.#createMenuItems(await this.sitemap.items(), currentPath);
        return urls;
    }

    #createMenuItems(items, currentPath) {
        return items
            .map(i => {
                const item = {
                    name: i.name,
                    classes: [],
                    items: this.#createMenuItems(i.items, currentPath)
                }

                if (i.path === currentPath) {
                    item.classes.push("active");
                }
                else if (currentPath.startsWith(i.path)) {
                    item.classes.push("active-child");
                }

                if (i.url) {
                    item.url = i.url;
                }

                if (i.items.length) {
                    item.classes.push("has-sibbling");
                }

                return item;

            })
            .filter(i => i.url || i.items?.length > 0)
            .map((item, _, items) => {
                if (item.classes.some(c => c.startsWith('active')))
                    return item;
                
                if (items.some(i => i.classes.some(c => c.startsWith('active')))) {
                    item.classes.push('active-sibbling');
                }

                return item;
            });
    }
}
