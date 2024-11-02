const fs = require('fs').promises;
const path = require('path');
const colors = require('colors');
const yaml = require('js-yaml');

const files = require('../../utils/files'); 

module.exports = class YmlFileParser {
    _extensions = [ ".command.yml", ".query.yml", ".event.yml", ".task.yml", ".command.yaml", ".query.yaml", ".event.yaml", ".task.yaml", ".md"];
    
    constructor({ options, pageUtil }) {
        this.options = options;
        this.pageUtil = pageUtil;
    }
    
    async parse(file) {
        if (!this._extensions.some(extension => file.endsWith(extension)))
            return;
        
        const ymlFile = await this.#determineYmlFile(file);
        const yml = await this.#addNameToYml(ymlFile);

        await fs.writeFile(`${ymlFile}`, yml);
        await fs.writeFile(`${ymlFile}.json`, JSON.stringify(yaml.load(yml)));
    }

    async #determineYmlFile(file) {
        if(!file.endsWith(".md"))
            return file;

        const ymlFile = `${file}.yml`;
        const ymlFiles = [ymlFile, `${file}.yaml`];
        
        let f;
        while(f = ymlFiles.pop()) {
            if(await files.exists(f)) {
                return f;
            }
        }
        
        await fs.writeFile(ymlFile, "");
        return ymlFile;
    }

    async #addNameToYml(file) {
        const yml = await files.readFileAsString(file);

        console.info(colors.green(`\t\t\t\t* parsing yaml`));
        const json = yaml.load(yml) || {};

        if(!this.#isLiteralObject(json))
            return yml;

        if(json.name)
            return yml;

        json.name = this.pageUtil.getTitleFromUrl(file);
        return yaml.dump(json);
    }

    #isLiteralObject = function(a) {
        return (!!a) && (a.constructor === Object);
    }
}