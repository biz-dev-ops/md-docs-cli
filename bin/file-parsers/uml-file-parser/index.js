const fs = require('fs');
const path = require('path');
const chalk = require('chalk-next');
const plantuml = require('node-plantuml');
const files = require('../../utils/files');

module.exports = class UmlFileParser {
    constructor({ options }) {
        this.options = options;
    }

    async parse(file) {
        if (!(file.endsWith('.puml')))
            return;

        const svgFile = `${file}.svg`;
        console.info(chalk.green(`\t* creating ${path.relative(this.options.dst, svgFile)}`));

        const uml = await files.readFileAsString(file);

        await on(
            plantuml
                .generate(uml, { format: 'svg' })
                .out.pipe(fs.createWriteStream(svgFile))
        );
    }
}

async function on(stream) {
    return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve());
        stream.on('error', () => reject());
    });
}