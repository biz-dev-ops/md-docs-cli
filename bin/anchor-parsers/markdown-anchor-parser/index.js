const fs = require('fs').promises;
const chalk = require('chalk-next');
const path = require('path');
const { env } = require('process');

const AnchorParser = require('../anchor-parser');

//TODO: find solution for renderer problem.
module.exports = class MarkdownAnchorParser extends AnchorParser {
  // constructor({ markdownRenderer}) {
  //   super();

  //   this.renderer = markdownRenderer;
  // }

  constructor() {
    super();
  }

  _canParse(anchor) { return path.basename(anchor.href).endsWith('.md') || anchor.href.includes('.md#'); }

  async _parse(anchor) {
    console.info(chalk.green(`\t\t\t\t* changing href`));

    if (anchor.href.endsWith('.md')) {
      anchor.href = `${anchor.href.substring(0, anchor.href.length - 3)}.html`;
    }
    else {
      anchor.href = anchor.href.replace('.md#', '.html#');
    }
  }

  // async _render(file) {
  //   if (!path.basename(file).startsWith('_'))
  //     return;

  //   console.info(chalk.green(`\t\t\t\t* rendering`));

  //   const markdown = await this._readFileAsString(file);
  //   const html = await this.renderer.render(markdown);

  //   if (env.NODE_ENV === 'development')
  //     await fs.writeFile(`${file}.html`, html);
    
  //   return html;
  // }
};
