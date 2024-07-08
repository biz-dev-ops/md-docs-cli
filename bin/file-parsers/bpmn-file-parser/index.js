const fs = require('fs').promises;
const files = require('../../utils/files');
const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");

module.exports = class BPMNFileParser {
    constructor({ options, sitemap }) {
        this.options = options;
        this.sitemap = sitemap;
        
        const xmlOptions = {
            ignoreAttributes: false,
            attributeNamePrefix : "@_",
            allowBooleanAttributes: true
        };

        this.parser = new XMLParser(xmlOptions);
        this.builder =  new XMLBuilder(xmlOptions);
    }

    async parse(file) {
        if (!(file.endsWith('.bpmn')))
            return;

        const xml = await this.#addLinksToBPMN(file);

        await fs.writeFile(file, xml);
    }

    async #addLinksToBPMN(file) {
        const xml = await files.readFileAsString(file);

        let xmlObject = this.parser.parse(xml);
        console.dir(xmlObject);

        traverseJsonObject(null, xmlObject, this.#checkElement.bind(this));
        console.dir(this.builder.build(xmlObject));

        throw Error("");

        return this.builder.build(xmlObject);
    }

    #checkElement(elementName, el) {
        if(!el?.hasOwnProperty("@_name") || elementName === "bizdevops:link") {
            return;
        }

        const links = this.#findLinks(el["@_name"]);

        if(!links || links.length === 0) {
            return;
        }

        el["bizdevops:links"] = {
            "bizdevops:link": links.map(link => new {
                "@_link": link.href,
                "@_name": link.name
            })
        };

        console.dir({ elementName, el })
    }

    #findLinks(name) {
        return [];
    }
}



function traverseJsonObject(objKey, obj, callback) {
    // Check if the object is null, undefined, or a primitive value
    if (obj === null || typeof obj !== 'object') {
        return;
    }

    // Iterate through each key-value pair
    for (const key in obj) {
        
        // Call the callback function for the current key-value pair
        callback(objKey, key, obj[key]);

        // If the value is an object, recursively traverse it
        if (typeof obj[key] === 'object') {
            traverseJsonObject(key, obj[key], callback);
        }
    }
}