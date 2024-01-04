const fs = require('fs').promises;
const { env } = require('process');
const colors = require('colors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const jsonSchemaParser = require('../../utils/json-schema-parser');

const AnchorParser = require('../anchor-parser');

module.exports = class businessModelCanvasAnchorParser extends AnchorParser {
  constructor({ businessModelCanvasComponent }) {
    super();

    this.component = businessModelCanvasComponent;
  }

  _canParse(anchor) { return anchor.href.endsWith('business-model-canvas.yml') || anchor.href.endsWith('business-model-canvas.yaml'); }

  async _parse(anchor, file) {
    console.info(colors.green(`\t\t\t\t* parsing yaml`));
    const json = await this.#getJson(file);
    
    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.json`, JSON.stringify(json));

    const id = `business-model-canvas-${uuidv4()}`;

    console.info(colors.green(`\t\t\t\t* rendering`));
    const html = this.component.render({ 
      id, 
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