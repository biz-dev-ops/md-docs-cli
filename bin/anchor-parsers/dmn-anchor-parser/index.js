const fs = require('fs').promises;
const { env } = require('process');
const colors = require('colors');

const files = require('../../utils/files');

const AnchorParser = require('../anchor-parser');

module.exports = class DmnAnchorParser extends AnchorParser {
  constructor({ options, dmnComponent }) {
    super();
  
    this.root = options.dst;
    this.component = dmnComponent;
  }

  _canParse(anchor) { return anchor.href.endsWith('.dmn'); }

  async _parse(anchor, file) {
    const xml = (await files.readFileAsString(file))
      .replace(/(\r\n|\n|\r)/gm, "")
      .replace(/'/g, "&apos");

    console.info(colors.green(`\t\t\t\t* rendering`));
    const html = this.component.render({ 
      xml 
    });

    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.html`, html);

    return html;
  }
};