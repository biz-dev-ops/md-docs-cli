const fs = require('fs').promises;
const path = require('path');
const md5 = require('md5');
const colors = require('colors');

const files = require('../../utils/files');

module.exports = class FeatureFileParser {
    constructor({ options }) {
        this.options = options;
    }

    async parse(file) {
        if (!(file.endsWith('.feature')))
            return;

        console.info(colors.green(`\t* creating release feature ${path.relative(this.options.dst, file)}`));
        const hash = await this.#addHash(file);
    }

    async #addHash(file) {
        const feature = await files.readFileAsString(file);
        const lines = feature.split('\n');
        const hash = md5(file);
        const index = lines.findIndex(l => l.includes(':'));
        lines[index] = `${lines[index]} (${hash})`;
        await fs.writeFile(file.replace('.feature', '.release.feature'), lines.join('\n'));
    }
}