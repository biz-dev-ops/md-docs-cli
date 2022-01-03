const chalk = require('chalk-next');

const AnchorParser = require('../html/anchor-parser');

const component = require('./openapi-component');

module.exports = class OpenapiAnchorParser extends AnchorParser {
  constructor() {
    super();
    
  }

  _canRender(anchor) { return anchor.href.endsWith(".openapi.yml"); }

  async _render(file) {
    console.info(chalk.green(`\t\t* rendering openapi anchor (${file})`));

    return component.render();
  }
};