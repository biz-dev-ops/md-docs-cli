const fs = require('fs').promises;
const colors = require('colors');
const path = require('path');
const { env, cwd } = require('process');
const { JSDOM } = require('jsdom');
const markdown_it_anchor = require('markdown-it-anchor');
const yaml = require('js-yaml');
const files = require('../files');

class Sitemap {
    static slugify(name) {
        return name
            .trim()
            .toLowerCase()
            .replaceAll(' ', '-')
            .replaceAll('\n', '-');
    }

    #data = null;
   
    constructor({ options, pageUtil }) {
        this.root = options.dst;
        this.pageUtil = pageUtil;
    }

    async init() {
        this.#data = await this.#getData();
    }

    async items() {
        if (!this.#data)
            this.#data = await this.#getData();

        return this.#data;
    }

    async link(xhtml, querySelector, nameParser, replacer) {
        const sitemap = await this.items();
        const dom = new JSDOM(xhtml);

        dom.window.document.body.children[0].querySelectorAll(querySelector).forEach(el => {
            let name;
            if(nameParser) {
                name = nameParser(el);
            }
            else {
                if(el.children.length === 0) {
                    name = el.textContent;
                }
                else {
                    name = Array.from(el.children)
                        .map(c => c.textContent.trim())
                        .join(" ")
                }
            }

            if(!name || name.trim().length === 0) 
                return;

            const slug = Sitemap.slugify(name);
            const hits = sitemap
                .find((el) => el.slug === slug)
                .filter(item => item.url);

            if(hits.length === 0) {
                return;
            }

            if(replacer) {
                replacer(el, hits);
            }
            else {
                if(el.children.length === 0) {
                    el.innerHTML = `<a href="${hits[0].url}" target="_top" style="text-decoration:underline;">${el.textContent}</a>`;
                }
                else {
                    Array.from(el.children).forEach(c => c.innerHTML = `<a href="${hits[0].url}" target="_top" style="text-decoration:underline;">${c.textContent}</a>`);
                }
            }
        });
        return dom.window.document.body.innerHTML
            .replaceAll("<br>", "<br />")
            .replaceAll("&nbsp;", "&#160;");
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
        const name = await this.pageUtil.getTitleFromUrl(src);

        const item = {
            type: "page",
            name: name,
            slug: Sitemap.slugify(name),
            path: path.relative(this.root, src),
            url: null,
            items: new SitemapArray()
        };

        if(item.path === "assets") {
            return;
        }

        for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
            const entryPath = path.resolve(src, entry.name);

            if(entry.name.startsWith("_")) {
                continue;
            }
            else if (entry.isDirectory()) {
               
                const sub = await this.#getMenuItem(entryPath);
                if (sub != undefined)
                    item.items.push(sub);
            }
            else if (entry.name === 'index.md') {
                item.url = this.#creatUrl(path.join(item.path, entry.name));
                console.info(colors.green(`\t* adding menu item ${item.url}`));

                item.useCases = new SitemapArray();
                item.useCases.push(
                    ...(await this.pageUtil.getHeadingsFrom(await files.readFileAsString(entryPath)))
                        .filter(i => i.heading === "h3")
                        .map(h => {
                            const useCaseSlug = markdown_it_anchor.defaults.slugify(h.content)
                            return {
                                type: "use-case",
                                name: h.content,
                                slug: useCaseSlug,
                                path: path.relative(this.root, src),
                                url: `${item.url}#${useCaseSlug}`
                            };
                        })
                );
            }
            else if(entry.name === 'index.md.yml' || entry.name === 'index.md.yaml') {
                item.meta = await this.#getMetaInformation(entryPath);
            }
        }

        return item;
    }

    async #getMetaInformation(src) {
        const content = await files.readFileAsString(src);
        return yaml.load(content);
    }

    #creatUrl(file) {
        return this.pageUtil.removeOrder(file)
            .slice(0, -3) + ".html";
    }
}

module.exports = Sitemap;

function SitemapArray() {
    this.find = function(comparer) {
        const hits = [];

        this.forEach(element => {
            if(comparer(element)) {
                hits.push(element);
            }
            
            if(element.useCases)
                hits.push(...element.useCases.find(comparer));

            if(element.items)
                hits.push(...element.items.find(comparer));
        });

        return hits;
    }

    this.findFirst = function(comparer) {
        if(typeof comparer === "string") {
            const name = comparer;
            comparer = (page) => page.slug === Sitemap.slugify(name);
        }

        let hit = null;

        this.every(element => {
            if(comparer(element)) {
                hit = element;
                return false;
            }
            else {
                hit = element.items?.findFirst(comparer) || element.useCases?.findFirst(comparer);
                if(hit) {
                    return false;
                }
            }

            return true;
        });
        

        return hit;
    }
}

SitemapArray.prototype = [];