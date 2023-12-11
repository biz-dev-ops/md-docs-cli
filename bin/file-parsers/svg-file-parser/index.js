const fs = require('fs').promises;
const files = require('../../utils/files');

module.exports = class SvgFileParser {
    constructor({ options }) {
        this.options = options;
    }

    async parse(file) {
        if (!(file.endsWith('.svg')))
            return;

        let svg = await files.readFileAsString(file);

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