const fs = require('fs').promises;
const files = require('../../utils/files');
const { XMLParser, XMLBuilder } = require("fast-xml-parser");

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

        xmlObject["bpmn:definitions"]["@_xmlns:bizdevops"] = "https://github.com/biz-dev-ops/web-components/schema/1.0";

        await traverseJsonObject(null, xmlObject, this.#checkElement.bind(this));

        return this.builder.build(xmlObject);
    }

    async #checkElement(elementName, el) {
        if(el?.hasOwnProperty("@_name") === false || elementName === "bizdevops:link") {
            return;
        }
        
        const links = await this.#findLinks(el["@_name"]);

        if(links?.length === 0) {
            return;
        }

        if(!el.hasOwnProperty("bpmn:extensionElements")) {
            el["bpmn:extensionElements"] = {};
        }

        el["bpmn:extensionElements"]["bizdevops:links"] = {
            "bizdevops:link": links.map(link => ({
                    "@_value": link.url,
                    "@_name": link.name
            }))
        };
    }

    async #findLinks(name) {
        if(!this.sitemapArray) {
            this.sitemapArray = await this.sitemap.items();
        }
        
        return this.sitemapArray.find(name).map(m => ({ 
            name: m.name,
            url: m.url
        }));
    }
}

async function traverseJsonObject(objKey, obj, callback) {
    if (obj === null || typeof obj !== 'object') {
        return;
    }

    for (const key in obj) {
        await callback(Array.isArray(obj) ? objKey : key, obj[key]);

        if (typeof obj[key] === 'object') {
            await traverseJsonObject(key, obj[key], callback);
        }
    }
}