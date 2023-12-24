const fs = require('fs').promises;
const colors = require('colors');
const path = require('path');
const { env, cwd } = require('process');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const markdown_it_anchor = require('markdown-it-anchor');
const slugify = function(name) {
    return name
        .trim()
        .toLowerCase()
        .replaceAll(' ', '-')
        .replaceAll('\n', '-');
}

const files = require('../files');

function SitemapArray() {
    this.find = function(slug) {
        const hits = [];

        this.forEach(element => {
            if(element.slug === slug) {
                hits.push({ name: element.name, url: element.url });
            }
            else {
                hits.push(...element.items.find(slug));
            }
        });

        return hits;
    }
}

SitemapArray.prototype = [];

module.exports = class Sitemap {
    static slugify(name) {
        return  name
            .trim()
            .toLowerCase()
            .replaceAll(' ', '-')
            .replaceAll('\n', '-');
    }

    #data = null;
    #regex = /(\d+[_])/ig;
    #regexHeader = /(?<flag>#{1,6})\s+(?<content>.+)/g

    constructor({ options, gitInfo }) {
        this.root = options.dst;
        this.git = gitInfo;
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

            const slug = slugify(name);

            const hits = sitemap.find(slug);
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
        const name = this.#format(src);

        const item = {
            name: name,
            slug: slugify(name),
            path: path.relative(this.root, src),
            items: new SitemapArray()
        };

        if(item.path === "assets") {
            return;
        }

        for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
            const entryPath = path.resolve(src, entry.name);

            if (entry.isDirectory()) {
               
                const sub = await this.#getMenuItem(entryPath);
                if (sub != undefined)
                    item.items.push(sub);
            }
            else if (entry.name === 'index.md') {
                const file = path.relative(this.root, entryPath);
                console.info(colors.green(`\t* adding menu item ${file}`));
                item.url = this.#rewriteUrl(`${file.slice(0, -3)}.html`);
                item.url = `/${this.git.branch.name}/${item.url}`;

                item.useCases = (await this.#getHeadingsFrom(entryPath))
                    .map(h => ({
                        name: h.content,
                        url: `${item.url}#${markdown_it_anchor.defaults.slugify(h.content)}`
                    }));
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
    
    async #getHeadingsFrom(markdownFile) {
        const markdown = await files.readFileAsString(markdownFile);
        
        return Array.from(markdown.matchAll(this.#regexHeader))
            .map(({ groups: { flag, content } }) => ({
                heading: `h${ flag.length }`,
                content
            }));
    }
}