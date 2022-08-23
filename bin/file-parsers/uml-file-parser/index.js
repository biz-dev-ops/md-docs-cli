const fs = require('fs').promises;
const path = require('path');
const colors = require('colors');
const plantuml = require('plantuml');
const files = require('../../utils/files');

module.exports = class UmlFileParser {
    constructor({ options }) {
        this.options = options;
    }

    async parse(file) {
        if (!(file.endsWith('.puml')))
            return;

        const svgFile = `${file}.svg`;
        console.info(colors.green(`\t* creating ${path.relative(this.options.dst, svgFile)}`));

        const uml = await files.readFileAsString(file);
        const svg = await plantuml(uml);

        await fs.writeFile(svgFile, svg);
   }
}