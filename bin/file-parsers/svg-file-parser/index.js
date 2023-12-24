const fs = require('fs').promises;
const { env } = require('process');
const files = require('../../utils/files');

module.exports = class SvgFileParser {
    constructor({ options, sitemap }) {
        this.options = options;
        this.sitemap = sitemap;
    }

    async parse(file) {
        if (!(file.endsWith('.svg')))
            return;

        let svg = await files.readFileAsString(file);

        if (env.NODE_ENV === 'development')
            await fs.writeFile(`${file}.raw.svg`, svg);

        svg = await this.sitemap.link(
            svg,
            "text"
        );

        svg = this.#addFont(svg);

        await fs.writeFile(file, svg);
    }

    #addFont(svg) {
        if(!this.options.page?.googleFont)
            return svg;
        
        return svg.replace('</svg>', `
            <defs>
                <style type="text/css">@import url(${this.options.page?.googleFont});</style>
            </defs>
            </svg>`);
    }
}