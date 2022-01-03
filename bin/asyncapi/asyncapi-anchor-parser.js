const chalk = require('chalk-next');

const AnchorParser = require('../html/anchor-parser');

const component = require('./asyncapi-component');

module.exports = class AsyncapiAnchorParser extends AnchorParser {
  constructor() {
    super();
  }

  _canRender(anchor) { return anchor.href.endsWith(".asyncapi.yml"); }

  async _render(file) {
    console.info(chalk.green(`\t\t* rendering BPMN anchor (${file})`));

    return component.render();
  }
};