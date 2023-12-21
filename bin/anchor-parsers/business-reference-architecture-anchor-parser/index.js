const fs = require('fs').promises;
const { env } = require('process');
const colors = require('colors');
const path = require('path');

const jsonSchemaParser = require('../../utils/json-schema-parser');

const AnchorParser = require('../anchor-parser');

module.exports = class BusinessReferenceArchitectureParser extends AnchorParser {
  constructor({ businessReferenceArchitectureComponent }) {
    super();

    this.component = businessReferenceArchitectureComponent;
  }

  _canParse(anchor) { return anchor.href.endsWith('business-reference-architecture.yml') || anchor.href.endsWith('business-reference-architecture.yaml'); }

  async _parse(anchor, file) {
    console.info(colors.green(`\t\t\t\t* parsing yaml`));
    const json = await this.#getJson(file);
    
    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.json`, JSON.stringify(json));

    console.info(colors.green(`\t\t\t\t* rendering`));
    const html = this.component.render({ 
      json: JSON.stringify(json)
        .replace(/(\r\n|\n|\r)/gm, "")
        .replace(/"/g, "&quot;")
    });

    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.html`, html);

    return html;
  }

  async #getJson(file) {
    const json = await jsonSchemaParser.parse(file);
    return json;
  }
};