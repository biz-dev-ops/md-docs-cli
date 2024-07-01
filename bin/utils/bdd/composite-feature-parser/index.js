const yaml = require('js-yaml');
const path = require('path');
const util = require('util');
const { glob } = require('glob');
const files = require('../../files');

module.exports = class CompositeFeatureParser {
    constructor({ pageUtil }) {
        this.pageUtil = pageUtil;
    }

    async parse(file) {
        let obj = await this.#readFile(file);
        if(Array.isArray(obj))
            return await this.#parseFileReferences(file, obj);

        return await this.#parseFileReference(file, obj);
    }

    async #parseFileReferences(src, refs) {
        const files = await Promise.all(refs.map(async ref => this.#parseFileReference(src, ref)));
        return files.flat();
    }

    async #parseFileReference(src, obj) {
        if (typeof obj == 'string') {
            const file = path.resolve(path.dirname(src), obj);
            
            if (path.extname(file) === '.feature') {
                return [file];
            }
            else if (file.endsWith('features.yml')) {
                return await this.parse(file);
            }
    
            throw new Error(`Unsupported file type: ${file}`);
        }
    
        if(obj.features) {
            const files =  await this.#parseFileReferences(src, obj.features);
            if(obj.name) {
                return [{
                    name: obj.name,
                    files
                }]
            }
    
            return files;
        }  
        
        if(obj.glob) {
            let files = await glob(obj.glob);

            files = files
                .filter(file => !file.includes("release."))
                .map(file => ({
                    name: this.#getNameFromFile(file),
                    files: [ file ]
                }));
            return files;
        }
    
        throw new Error(`Unsupported obj: ${JSON.stringify(obj)}`);
    }

    #getNameFromFile(file) {
        return this.pageUtil.getTitleFromUrl(path.dirname(file));
    }

    async #readFile(file) {
        const content = await files.readFileAsString(file);
        const json = yaml.load(content);
        return json;
    }
}