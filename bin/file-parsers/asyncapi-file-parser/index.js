const fs = require('fs').promises;
const { env, cwd } = require('process');
const path = require('path');
const colors = require('colors');
const yaml = require('js-yaml');
const { Parser } = require('@asyncapi/parser');

const files = require('../../utils/files');

module.exports = class AsyncApiFileParser {
    constructor({ options, asyncapiComponent, locale, pageUtil }) {
        this.options = options;
        this.component = asyncapiComponent;
        this.locale = locale;
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
        const ymlFile = `${file}.yml`;

        const json = {
            baseHref: this.pageUtil.relativeBaseHref(),
            root: this.pageUtil.relativeRootFromBaseHref()
        };

        if (await files.exists(ymlFile)) {
            json.data = yaml.load(await files.readFileAsString(ymlFile));
            json.data = JSON.parse(await this.definitionParser.render(JSON.stringify(json.data)));

            try {
                // Does not work without parsed json.
                json.data = (await this.parser.parse(json.data))['_json'];
            }
            catch (ex) {
                console.info(colors.brightRed(`\t\t\t\t* error parsing json`));
                throw new Error(ex);
            }
        }

        return json;
    }
}