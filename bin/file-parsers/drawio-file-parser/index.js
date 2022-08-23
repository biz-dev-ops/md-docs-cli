const fs = require('fs').promises;
const path = require('path');
const colors = require('colors');

module.exports = class DrawIOFileParser {
    constructor({ options, drawIORenderer }) {
        this.options = options;
        this.drawIORenderer = drawIORenderer;
    }

    async parse(file) {
        if (!(file.endsWith('.drawio')))
            return;

        const svgFile = `${file}.svg`;
        console.info(colors.green(`\t* creating ${path.relative(this.options.dst, svgFile)}`));

        const svg = await this.drawIORenderer.render(file);

        await fs.writeFile(svgFile, svg);
    }
}