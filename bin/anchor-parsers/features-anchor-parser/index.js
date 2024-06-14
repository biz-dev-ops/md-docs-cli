const fs = require('fs').promises;
const { env } = require('process');
const colors = require('colors');

const AnchorParser = require('../anchor-parser');

module.exports = class FeaturesAnchorParser extends AnchorParser {
  constructor({ featureComponent, gherkinParser, compositeFeatureParser }) {
    super();

    this.component = featureComponent;
    this.gherkinParser = gherkinParser;
    this.compositeFeatureParser = compositeFeatureParser;
  }

  _canParse(anchor) { return anchor.href.endsWith('.features.yml') || anchor.href.endsWith('.features.yaml'); }

  async _parse(anchor, file) {
    console.info(colors.green(`\t\t\t\t* parsing file`));
    
    const files = await this.compositeFeatureParser.parse(file);

    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.files.json`, JSON.stringify(files));

    console.info(colors.green(`\t\t\t\t* parsing ${files.length} features`));
    const features = await this.gherkinParser.parse(files);

    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.features.json`, JSON.stringify(features));
    
    const grouped = this.gherkinParser.group(features);

    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.grouped.json`, JSON.stringify(grouped));

    console.info(colors.green(`\t\t\t\t* rendering`));
    return this.component.render({ features: grouped });
  }
};