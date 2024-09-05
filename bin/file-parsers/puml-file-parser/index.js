const fs = require('fs').promises;
const { env } = require('process');
const { EOL } = require("node:os");  
const colors = require('colors');
const files = require('../../utils/files');
const Sitemap = require('../../utils/sitemap');

module.exports = class PumlFileParser {
    #sitemapItems;

    constructor({ options, sitemap }) {
        this.options = options;
        this.sitemap = sitemap;
    }

    async parse(file) {
        if (!(file.endsWith('.puml')))
            return;

        console.info(colors.green(`\t\t\t\t* parsing puml`));

        if(!this.#sitemapItems) {
            await this.sitemap.init();
            this.#sitemapItems = await this.sitemap.items();
        }

        let puml = await files.readFileAsString(file);

        if (env.NODE_ENV === 'development')
            await fs.writeFile(`${file}.raw.puml`, puml);

        puml = puml.split(/\r?\n/)
            .map(line => this.#addLinkToLine(line))
            .join(EOL);

        await fs.writeFile(file, puml);
    }

    #addLinkToLine(line) {
        if (line.includes("$link") || /^\s*[a-zA-Z_]+\([^)]+\)$/.test(line) === false) {
            return line;
        }

        const parts = line.split(",");
        const url = this.#findUrl(parts)
        if(!url) {
            return line;
        }

        parts.push(parts.pop().replace(")", `, $link="${url}")`));
        return parts.join(",");
    }

    #findUrl(parts) {
        const elementName = parts.find(part => /^"([^"]+)"$/.test(part.trim()));
        if(!elementName) {
            return;
        }

        const slug = Sitemap.slugify(elementName.trim().slice(1, -1));
        const hits = this.#sitemapItems
            .find((el) => el.slug === slug)
            .filter(item => item.url);

        if(hits.length > 0) {
            return hits[0].url;
        }

        return null;
    }
}