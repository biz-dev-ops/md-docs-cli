const fs = require('fs').promises;
const path = require('path');
const colors = require('colors');
const yaml = require('js-yaml');
const files = require('../../utils/files');

module.exports = class UseCaseFileParser {
    _extensions = [ ".command.yml", ".query.yml", ".event.yml", ".task.yml", ".command.yaml", ".query.yaml", ".event.yaml", ".task.yaml"];

    constructor({ options, pageUtil }) {
        this.options = options;
        this.pageUtil = pageUtil;
    }
    
    async parse(file) {
        if (!this._extensions.some(extension => file.endsWith(extension)))
            return;

        console.info(colors.green(`\t\t\t\t* parsing yaml`));
        const json = await this.#getJson(file);
        if(!json.name) {
            json.name = this.#getNameFromFile(file);
        }
        
        await fs.writeFile(`${file}.json`, JSON.stringify(json));
    }

    #getNameFromFile(file) {
        const name = path.basename(file).split(".")[0];
        if(name !== "index") {
            return this.pageUtil.createTitle(name);
        }

        return this.pageUtil.createTitle(path.basename(path.dirname(file)));
    }

    async #getJson(file) {
        const content = await files.readFileAsString(file);
        const json = yaml.load(content);
        return json;
    }
}