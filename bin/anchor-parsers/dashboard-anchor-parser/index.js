const fs = require('fs').promises;
const { env } = require('process');
const colors = require('colors');

const files = require('../../utils/files');

const AnchorParser = require('../anchor-parser');

module.exports = class DasboardAnchorParser extends AnchorParser {
  constructor({ dashboardComponent, definitionParser }) {
    super();

    this.component = dashboardComponent;
    this.definitionParser = definitionParser;
  }

  _canParse(anchor) { return anchor.href.endsWith('.dashboard.yml') || anchor.href.endsWith('.dashboard.yaml'); }

  async _parse(anchor, file) {    
    const json = JSON.parse(await files.readFileAsString(`${file}.json`));

    console.info(colors.green(`\t\t\t\t* rendering`));
    const html = this.component.render(json);
    
    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.html`, html);

    return await this.definitionParser.parse(html);
  }
};