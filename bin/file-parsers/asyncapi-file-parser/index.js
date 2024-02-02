const fs = require('fs').promises;
const { env } = require('process');
const path = require('path');
const colors = require('colors');
const { Parser } = require('@asyncapi/parser');

const jsonSchemaParser = require('../../utils/json-schema-parser');
const files = require('../../utils/files');

module.exports = class AsyncapiFileParser {
    constructor({ options, asyncapiComponent, definitionParser, pageUtil }) {
        this.options = options;
        this.component = asyncapiComponent;
        this.definitionParser = definitionParser;
        this.pageUtil = pageUtil;
        this.parser = new Parser();
    }

    async parse(file) {
        if (!(file.endsWith('.asyncapi.yml') || file.endsWith('.asyncapi.yaml')))
            return;

        await this.#render(file);
    }

    async #render(file) {
        console.info(colors.green(`\t* render html`));

        const htmlFile = `${file}.html`;
        console.info(colors.green(`\t\t* creating ${path.relative(this.options.dst, htmlFile)}`));

        const data = await this.#createData(file);

        if (env.NODE_ENV === 'development')
            await fs.writeFile(`${file}.json`, JSON.stringify(data));

        const html = this.component.render(data);

        await fs.writeFile(htmlFile, html);
    }

    async #createData(file) {
        const json = {
            baseHref: this.pageUtil.relativeBaseHref(),
            root: this.pageUtil.relativeRootFromBaseHref()
        };

        json.schema = await jsonSchemaParser.parse(file);
        json.schema = (await this.definitionParser.render(JSON.stringify(json.schema))).replace(/\n/g, "\\n");

        try {
            // Does not work without parsed json.
            json.schema = (await this.parser.parse(json.schema))['_json'];
            json.schema = JSON.stringify(json.schema);
        }
        catch (ex) {
            console.info(colors.brightRed(`\t\t\t\t* error parsing json`));
            throw new Error(ex);
        }

        return json;
    }
}