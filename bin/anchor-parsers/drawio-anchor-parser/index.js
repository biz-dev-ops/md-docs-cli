const colors = require('colors');
const files = require('../../utils/files');

const AnchorParser = require('../anchor-parser');

module.exports = class DrawioAnchorParser extends AnchorParser {
  regex = /<diagram.*?>([^<]*)<\/diagram>/gm

  constructor({ options  }) {
    super();

    this.root = options.dst;
  }

  _canParse(anchor) { return anchor.href.endsWith('.drawio'); }

  async _parse(anchor, file) {
    console.info(colors.green(`\t\t\t\t* reading xml`));
    const content = (await files.readFileAsString(file));

    console.log(encodeURIComponent(content));

    console.info(colors.green(`\t\t\t\t* rendering container`));
    return `<div class="drawio-diagram" data-diagram-data="${encodeURIComponent(content)}"></div>`;
  }  
};