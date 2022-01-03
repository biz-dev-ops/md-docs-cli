const chalk = require('chalk-next');

const path = require('path');

const AnchorParser = require('../html/anchor-parser');

module.exports = class MarkdownAnchorParser extends AnchorParser {
  constructor(options) {
    super();
    this.renderer = options.renderer;
  }

  _canParse(anchor) { return path.basename(anchor.href).endsWith('.md') || anchor.href.includes(".md#"); }

  _canRender(anchor) { return _canParse(anchor) && path.basename(anchor.href).startsWith('_'); }

  async _parse(anchor) {
    console.info(chalk.green(`\t\t* parsing markdown anchor (${anchor.href})`));

    if(anchor.href.endsWith(".md")) {
        anchor.href = `${anchor.href.substring(0, anchor.href.length - 3)}.html`;
    }
    else {
        anchor.href = anchor.href.replace(".md#", ".html#");
    }
  }

  async _render(file) {
    console.info(chalk.green(`\t\t* rendering markdown anchor (${file})`));

    const markdown = await this._readFileAsString(file);
    return await this.renderer.render(markdown);
  }
};
