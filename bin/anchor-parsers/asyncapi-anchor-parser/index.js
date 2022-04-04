const fs = require('fs').promises;
const { cwd } = require('process');
const path = require('path');
const chalk = require('chalk-next');
const AsyncApiParser = require('@asyncapi/parser');

const jsonSchemaParser = require('../../utils/json-schema-parser');
const files = require('../../utils/files');

const AnchorParser = require('../anchor-parser');

module.exports = class AsyncapiAnchorParser extends AnchorParser {
  constructor({ options, defintionParser, asyncapiComponent, iFrameComponent  }) {
    super();

    this.root = options.dst;
    this.defintionParser = defintionParser;
    this.asyncapiComponent = asyncapiComponent;
    this.iFrameComponent = iFrameComponent;
  }

  _canParse(anchor) { return anchor.href.endsWith('.asyncapi.yml') || anchor.href.endsWith('.asyncapi.yaml'); }

  async _parse(anchor, file) {
    console.info(chalk.green(`\t\t\t\t* parsing yaml`));
    let json = await this.#getJson(file);

    try {
      // Does not work without parsed json.
      json = (await AsyncApiParser.parse(json))['_json'];
    }
    catch (ex) {
      console.info(chalk.redBright(`\t\t\t\t* error parsing json`));
      throw new Error(ex);
    }

    let relativeRoot = path.relative(path.dirname(file), this.root);
    if (relativeRoot !== '')
      relativeRoot += '/';

    console.info(chalk.green(`\t\t\t\t* rendering page`));
    const html = this.asyncapiComponent.render({
      schema: JSON.stringify(json),
      root: relativeRoot
    });

    const htmlFile = `${file}.html`;

    console.info(chalk.green(`\t\t\t\t* creating ${path.relative(cwd(), htmlFile)}`));
    await fs.writeFile(htmlFile, html);    

    const hash = await files.hash(htmlFile);

    console.info(chalk.green(`\t\t\t\t* rendering iframe`));
    return this.iFrameComponent.render({
      name: 'asyncapi',
      src: `./${path.relative(cwd(), htmlFile)}?_v=${hash}`,
    });
  }

  async #getJson(file) {
    const json = await jsonSchemaParser.parse(file);
    return JSON.parse(await this.defintionParser.render(JSON.stringify(json)));
  }
};