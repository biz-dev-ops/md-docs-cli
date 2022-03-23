const fs = require('fs').promises;
const { cwd } = require('process');
const path = require('path');
const chalk = require('chalk-next');

const jsonSchemaParser = require('../../utils/json-schema-parser');
const files = require('../../utils/files');

const AnchorParser = require('../anchor-parser');

module.exports = class OpenapiAnchorParser extends AnchorParser {
  constructor({ options, defintionParser, openapiComponent, iFrameComponent }) {
    super();

    this.root = options.dst;
    this.defintionParser = defintionParser;
    this.openapiComponent = openapiComponent;
    this.iFrameComponent = iFrameComponent;
  }

  _canParse(anchor) { return anchor.href.endsWith('.openapi.yml') || anchor.href.endsWith('.openapi.yaml'); }

  async _parse(anchor, file) {
    console.info(chalk.green(`\t\t\t\t* parsing yaml`));
    const json = await this.#getJson(file);

    let relativeRoot = path.relative(path.dirname(file), this.root);
    if (relativeRoot !== '')
      relativeRoot += '/';

    console.info(chalk.green(`\t\t\t\t* rendering page`));
    const html = this.openapiComponent.render({
      spec: JSON.stringify(json),
      root: relativeRoot
    });

    const htmlFile = `${file}.html`;

    console.info(chalk.green(`\t\t\t\t* creating ${path.relative(cwd(), htmlFile)}`));
    await fs.writeFile(htmlFile, html);

    const hash = await files.hash(htmlFile);

    console.info(chalk.green(`\t\t\t\t* rendering iframe`));
    return this.iFrameComponent.render({
      name: 'openapi',
      src: `./${path.relative(cwd(), htmlFile)}?_v=${hash}`,
    });
  }

  async #getJson(file) {
    const json = await jsonSchemaParser.parse(file);
    return JSON.parse(await this.defintionParser.render(JSON.stringify(json)));
  }
};