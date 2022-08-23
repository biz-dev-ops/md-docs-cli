const colors = require('colors');
const path = require('path');

const AnchorParser = require('../anchor-parser');

module.exports = class MarkdownAnchorParser extends AnchorParser {
  constructor() {
    super();
  }

    _canParse(anchor) {
        return (path.basename(anchor.href).endsWith('.md') || anchor.href.includes('.md#')) &&
          path.basename(anchor.href).indexOf('.message.md') < 0 && path.basename(anchor.href).indexOf('.email.md') < 0;
    }

  async _parse(anchor, file) {
    console.info(colors.green(`\t\t\t\t* changing href`));

    if (anchor.href.endsWith('.md')) {
      anchor.href = `${anchor.href.substring(0, anchor.href.length - 3)}.html`;
    }
    else {
      anchor.href = anchor.href.replace('.md#', '.html#');
    }
  }
};