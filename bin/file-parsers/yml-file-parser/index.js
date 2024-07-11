const fs = require('fs').promises;
const path = require('path');
const colors = require('colors');
const yaml = require('js-yaml');

const files = require('../../utils/files'); 

module.exports = class UseCaseFileParser {
    _extensions = [ ".command.yml", ".query.yml", ".event.yml", ".task.yml", ".command.yaml", ".query.yaml", ".event.yaml", ".task.yaml", ".md.yml", ".md.yaml"];
    
    constructor({ options, pageUtil }) {
        this.options = options;
        this.pageUtil = pageUtil;
    }
    
    async parse(file) {
        if (!this._extensions.some(extension => file.endsWith(extension)))
            return;

        const yml = await this.#addNameToYml(file);
        
        await fs.writeFile(file, yml);
        console.dir({
            yml,
            json: JSON.stringify(yaml.load(yml))
        });

        await fs.writeFile(`${file}.json`, JSON.stringify(yaml.load(yml)));
    }

    async #addNameToYml(file) {
        const yml = await files.readFileAsString(file);

        console.info(colors.green(`\t\t\t\t* parsing yaml`));
        const json = yaml.load(yml);

        if(!this.#isLiteralObject(json))
            return yml;

        if(json.name)
            return yml;

        json.name = this.#getNameFromFile(file);
        return yaml.dump(json);
    }

    #getNameFromFile(file) {
        const name = path.basename(file).split(".")[0];
        if(name !== "index") {
            return this.pageUtil.createTitle(name);
        }

        return this.pageUtil.createTitle(path.basename(path.dirname(file)));
    }

    #isLiteralObject = function(a) {
        return (!!a) && (a.constructor === Object);
    }
}