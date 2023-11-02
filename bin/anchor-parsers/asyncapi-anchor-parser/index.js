const fs = require('fs').promises;
const { cwd } = require('process');
const path = require('path');
const colors = require('colors');
const { Parser } = require('@asyncapi/parser');
const parser = new Parser();

const jsonSchemaParser = require('../../utils/json-schema-parser');
const files = require('../../utils/files');

const AnchorParser = require('../anchor-parser');

module.exports = class AsyncapiAnchorParser extends AnchorParser {
  constructor({ options, definitionParser, asyncapiComponent, iFrameComponent  }) {
    super();

    this.root = options.dst;
    this.definitionParser = definitionParser;
    this.asyncapiComponent = asyncapiComponent;
    this.iFrameComponent = iFrameComponent;
  }

  _canParse(anchor) { return anchor.href.endsWith('.asyncapi.yml') || anchor.href.endsWith('.asyncapi.yaml'); }

  async _parse(anchor, file) {
    console.info(colors.green(`\t\t\t\t* parsing yaml`));
    let json = await this.#getJson(file);

    try {
      // Does not work without parsed json.
      json = (await parser.parse(json))['_json'];
    }
    catch (ex) {
      console.info(colors.brightRed(`\t\t\t\t* error parsing json`));
      throw new Error(ex);
    }

    let relativeRoot = path.relative(path.dirname(file), this.root);
    if (relativeRoot !== '')
      relativeRoot += '/';

    console.info(colors.green(`\t\t\t\t* rendering page`));
    const html = this.asyncapiComponent.render({
      schema: JSON.stringify(json),
      root: relativeRoot
    });

    const htmlFile = `${file}.html`;

    console.info(colors.green(`\t\t\t\t* creating ${path.relative(cwd(), htmlFile)}`));
    await fs.writeFile(htmlFile, html);    

    const hash = await files.hash(htmlFile);

    console.info(colors.green(`\t\t\t\t* rendering iframe`));
    return this.iFrameComponent.render({
      name: 'asyncapi',
      src: `./${path.relative(cwd(), htmlFile)}?_v=${hash}`,
    });
  }

  async #getJson(file) {
    const json = await jsonSchemaParser.parse(file);
    return JSON.parse(await this.definitionParser.render(JSON.stringify(json)));
  }
};