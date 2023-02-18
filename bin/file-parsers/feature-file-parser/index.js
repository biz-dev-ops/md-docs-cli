const fs = require('fs').promises;
const path = require('path');
const md5 = require('md5');
const colors = require('colors');
const mustache = require('mustache');
const yaml = require('js-yaml');

const files = require('../../utils/files');

module.exports = class FeatureFileParser {
    constructor({ options }) {
        this.options = options;
    }

    async parse(file) {
        if (!(file.endsWith('.feature')))
            return;
        
        console.info(colors.green(`\t* creating release feature ${path.relative(this.options.dst, file)}`));

        let feature = await this.#parseTemplate(file);
        await fs.writeFile(file, feature);

        feature = this.#addHash(feature, md5(path.relative(this.options.dst, file)));
        await fs.writeFile(file.replace('.feature', '.release.feature'), feature);
    }

    async #parseTemplate(file) {
        let feature = await files.readFileAsString(file);
        const ymlFile = `${file}.yml`;
        if (!await files.exists(ymlFile))
          return feature;
    
        const content = await files.readFileAsString(ymlFile);
        const json = yaml.load(content);
        const temmplate = feature.replaceAll('#{{', '{{');

        feature = mustache.render(temmplate, json);
        return feature;
    }

    #addHash(feature, hash) {
        const lines = feature.split('\n');
        const index = lines.findIndex(l => l.includes(':'));
        lines[index] = `${lines[index]} (${hash})`;
        return lines.join('\n');
    }
}