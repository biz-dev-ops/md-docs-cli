const fs = require('fs').promises;
const colors = require('colors');

const jsonSchemaParser = require('../../utils/json-schema-parser'); 

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
        
        await fs.writeFile(`${file}.json`, JSON.stringify(json));
    }

    async #getJson(file) {
        let json = await jsonSchemaParser.parse(file);
       
        return json;
    }
}