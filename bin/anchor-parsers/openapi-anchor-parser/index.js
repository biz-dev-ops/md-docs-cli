const fs = require('fs').promises;
const { env, cwd } = require('process');
const path = require('path');
const chalk = require('chalk-next');

const jsonSchemaParser = require('../../utils/json-schema-parser');

const AnchorParser = require('../anchor-parser');
const OpenapiComponent = require('../../components/openapi-component');
const IFrameComponent = require('../../components/iframe-component');

module.exports = class OpenapiAnchorParser extends AnchorParser {
  constructor(options) {
    super(options);

    this.root = options?.root;
    this.openapiComponent = new OpenapiComponent(options?.template);
    this.iframeComponent = new IFrameComponent(options?.template);
  }

  _canParse(anchor) { return anchor.href.endsWith(".openapi.yml"); }

  async _render(file) {
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
    return this.iframeComponent.render({
      name: 'openapi',
      src: `./${path.relative(cwd(), htmlFile)}`,
    });
  }
};