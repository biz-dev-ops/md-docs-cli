const fs = require('fs').promises;
const path = require('path');
const colors = require('colors');
const files = require('../../utils/files');

module.exports = class SvgFileParser {
    constructor({ options }) {
        this.options = options;
    }

    async parse(file) {
        if (!(file.endsWith('.svg')))
            return;

        let svg = await files.readFileAsString(file);

        if(this.options.page?.googleFont) {
            svg = svg.replace('</svg>', `
            <defs>
                <style type="text/css">@import url(${this.options.page?.googleFont});</style>
            </defs>
            </svg>`);
        }

        await fs.writeFile(file, svg);
    }
}