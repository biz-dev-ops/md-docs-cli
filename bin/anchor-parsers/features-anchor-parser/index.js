const fs = require('fs').promises;
const { env } = require('process');
const colors = require('colors');

const AnchorParser = require('../anchor-parser');

const compositeParser = require('../../utils/bdd/composite-feature-parser');

module.exports = class FeaturesAnchorParser extends AnchorParser {
  constructor({ featureComponent, definitionParser, gherkinParser }) {
    super();

    this.component = featureComponent;
    this.definitionParser = definitionParser;
    this.gherkinParser = gherkinParser;
  }

  _canParse(anchor) { return anchor.href.endsWith('.features.yml') || anchor.href.endsWith('.features.yaml'); }

  async _parse(anchor, file) {
    console.info(colors.green(`\t\t\t\t* parsing file`));
    
    const files = await compositeParser.parse(file);

    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.files.json`, JSON.stringify(files));

    console.info(colors.green(`\t\t\t\t* parsing ${files.length} features`));
    let features = await this.gherkinParser.parseAndGroup(files);

    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.features.json`, JSON.stringify(features));

    console.info(colors.green(`\t\t\t\t* rendering`));
    return await this.definitionParser.parse(this.component.render({ features }));
  }
};