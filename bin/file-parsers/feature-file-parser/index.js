const fs = require('fs').promises;
const path = require('path');
const md5 = require('md5');
const colors = require('colors');
const mustache = require('mustache');
const yaml = require('js-yaml');

const files = require('../../utils/files');

module.exports = class FeatureFileParser {
    constructor({ options, pageUtil }) {
        this.options = options;
        this.pageUtil = pageUtil;
    }

    async parse(file) {
        if (!(file.endsWith('.feature')))
            return;
        
        console.info(colors.green(`\t* creating release feature ${path.relative(this.options.dst, file)}`));

        let feature = await this.#parseTemplate(file);

        feature = this.#addHash(feature, md5(path.relative(this.options.dst, file)));
        
        await fs.writeFile(file, feature);
        
    }

    async #parseTemplate(file) {
        const feature = await files.readFileAsString(file);
        const template = feature.replaceAll('#{{', '{{');
        const json = await this.#getJson(file);
        return mustache.render(template, json);
    }

    async #getJson(file) {
        const json = {
            folder:  {
                name: this.pageUtil.getTitleFromUrl(path.join(path.dirname(file), "index.md"))
            },
            file: {
                name: this.pageUtil.getTitleFromUrl(file)
            }
        }

        const yml = `${file}.yml`;

        if (!await files.exists(yml)) {
          return json;
        }

        const content = await files.readFileAsString(yml);
        return Object.assign(json, yaml.load(content));
    }

    #addHash(feature, hash) {
        const lines = feature.split('\n');
        const index = lines.findIndex(l => !l.trim().startsWith('#') && l.includes(':'));
        lines[index] = `${lines[index]} (${hash})`;
        return lines.join('\n');
    }
}