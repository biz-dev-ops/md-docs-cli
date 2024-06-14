const fs = require('fs').promises;
const { env } = require('process');
const path = require('path');
const colors = require('colors');

const jsonSchemaParser = require('../../utils/json-schema-parser');

module.exports = class OpenapiFileParser {
    constructor({ options, openapiComponent, pageUtil }) {
        this.options = options;
        this.component = openapiComponent;
        this.pageUtil = pageUtil;
    }

    async parse(file) {
        if (!(file.endsWith('.openapi.yml') || file.endsWith('.openapi.yaml')))
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

        return json;
    }
}