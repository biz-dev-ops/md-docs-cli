const fs = require('fs').promises;
const { cwd } = require('process');
const path = require('path');
const chalk = require('chalk-next');

const jsonSchemaParser = require('../../utils/json-schema-parser');

const AnchorParser = require('../anchor-parser');

module.exports = class OpenapiAnchorParser extends AnchorParser {
  constructor({ options, openapiComponent, iFrameComponent }) {
    super();

    this.root = options.dst;
    this.openapiComponent = openapiComponent;
    this.iFrameComponent = iFrameComponent;
  }

  _canParse(anchor) { return anchor.href.endsWith('.openapi.yml') || anchor.href.endsWith('.openapi.yaml'); }

  async _parse(anchor, file) {
    console.info(chalk.green(`\t\t\t\t* parsing yaml`));
    const json = await jsonSchemaParser.parse(file);

    console.info(chalk.green(`\t\t\t\t* rendering page`));
    const html = this.openapiComponent.render({ 
      spec: JSON.stringify(json),
      root: this.root
    });

    const htmlFile = `${file}.html`;

    console.info(chalk.green(`\t\t\t\t* creating ${path.relative(cwd(), htmlFile)}`));
    await fs.writeFile(htmlFile, html);

    console.info(chalk.green(`\t\t\t\t* rendering iframe`));
    return this.iFrameComponent.render({
      name: 'openapi',
      src: `./${path.relative(cwd(), htmlFile)}`,
    });
  }
};