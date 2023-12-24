require('process');

module.exports = class Menu {
    constructor({ sitemap }) {
        this.sitemap = sitemap;
    }

    async items(currentUrl) {
        const urls = this.#createMenuItems(await this.sitemap.items(), currentUrl);
        return urls;
    }

    #createMenuItems(items, currentUrl) {
        return items
            .filter(i => i.url || i.items?.length > 0)
            .map(i => {
                const item = {
                    name: i.name,
                    classes: [],
                    items: this.#createMenuItems(i.items, currentUrl)
                }

                if (i.url === currentUrl) {
                    item.classes.push("active");
                }
                else if (currentUrl.startsWith(i.path)) {
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
            .map((item, index, items) => {
                if (item.classes.some(c => c.startsWith('active')))
                    return item;
                
                if (items.some(i => i.classes.some(c => c.startsWith('active')))) {
                    item.classes.push('active-sibbling');
                }

                return item;
            });
    }
}
