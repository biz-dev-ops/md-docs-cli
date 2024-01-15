const fs = require('fs').promises;
const { env } = require('process');
const colors = require('colors');

const files = require('../../utils/files');

const AnchorParser = require('../anchor-parser');

module.exports = class BusinessReferenceArchitectureParser extends AnchorParser {
  constructor({ businessReferenceArchitectureComponent, sitemap }) {
    super();

    this.component = businessReferenceArchitectureComponent;
    this.sitemap = sitemap;
  }

  _canParse(anchor) { return anchor.href.endsWith('business-reference-architecture.yml') || anchor.href.endsWith('business-reference-architecture.yaml'); }

  async _parse(anchor, file) {
    console.info(colors.green(`\t\t\t\t* parsing yaml`));
    const json = JSON.parse(await files.readFileAsString(`${file}.json`));

    console.info(colors.green(`\t\t\t\t* rendering`));
    const html = this.component.render({
      json: json
    });

    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.html`, html);

    return html;
  }
}