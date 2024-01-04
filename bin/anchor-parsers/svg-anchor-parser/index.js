const path = require('path');
const colors = require('colors');

const AnchorParser = require('../anchor-parser');

module.exports = class ImageAnchorParser extends AnchorParser {
  constructor({ options }) {
    super();
  
    this.root = options.dst;
  }

  _canParse(anchor) { return path.basename(anchor.href).endsWith('.svg'); }

  async _parse(anchor, file) {
    console.info(colors.green(`\t\t\t\t* creating svg tag ${path.relative(this.root, file)}`));

    return `<embed type="image/svg+xml" src='${anchor.href}' alt='${anchor.text}' />`;
  } 
};