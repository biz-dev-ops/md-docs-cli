const chalk = require('chalk-next');

const AnchorParser = require('../html/anchor-parser');

module.exports = class UmlTaskAnchorParser extends AnchorParser {
  constructor() {
    super();
    
  }

  _canRender(anchor) { return anchor.href.endsWith(".puml"); }

  async _render(file) {
    console.info(chalk.green(`\t\t* rendering uml anchor (${file})`));

    return component.render();
  }
};