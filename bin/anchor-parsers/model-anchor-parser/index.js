const fs = require('fs').promises;
const { env } = require('process');
const colors = require('colors');
const { v4: uuidv4 } = require('uuid');

const jsonSchemaParser = require('../../utils/json-schema-parser');

const AnchorParser = require('../anchor-parser');

module.exports = class ModelAnchorParser extends AnchorParser {
  constructor({ modelComponent, definitionParser }) {
    super();

    this.component = modelComponent;
    this.definitionParser = definitionParser;
  }

  _canParse(anchor) { return anchor.href.endsWith('.model.yml') || anchor.href.endsWith('.model.yaml'); }

  async _parse(anchor, file) {
    console.info(colors.green(`\t\t\t\t* parsing yaml`));
    const json = await this.#getJson(file);
    
    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.json`, JSON.stringify(json));

    const id = `model-container-${uuidv4()}`;

    console.info(colors.green(`\t\t\t\t* rendering`));
    const html = this.component.render({ id, json });

    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.html`, html);

    return html;
  }

  async #getJson(file) {
    const json = await jsonSchemaParser.parse(file);
    return JSON.parse((await this.definitionParser.render(JSON.stringify(json))).replace(/\n/g, "\\n"));
  }
};