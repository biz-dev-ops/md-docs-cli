const fs = require('fs').promises;
const { env } = require('process');
const colors = require('colors');

const AnchorParser = require('../anchor-parser');

const compositeParser = require('../../utils/bdd/composite-feature-parser');
const gherkin = require('../../utils/bdd/gherkin-parser');
const specflow = require('../../utils/bdd/specflow-test-executions-parser');


module.exports = class FeaturesAnchorParser extends AnchorParser {
  constructor({ options, testExecutionParser, featureComponent }) {
    super();

    this.testExecutionParser = testExecutionParser;
    this.component = featureComponent;
  }

  _canParse(anchor) { return anchor.href.endsWith('.features.yml') || anchor.href.endsWith('.features.yaml'); }

  async _parse(anchor, file) {
    console.info(colors.green(`\t\t\t\t* parsing file`));
    
    const files = await compositeParser.parse(file);

    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.files.json`, JSON.stringify(files));

    console.info(colors.green(`\t\t\t\t* parsing ${files.length} features`));
    const features = await gherkin.parse(files);

    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.features.json`, JSON.stringify(features));

    const executions = await this.testExecutionParser.get();
    
    console.info(colors.green(`\t\t\t\t* parsing executions file`));    
    specflow.parse(features, executions);
    
    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.features.json`, JSON.stringify(features));

    console.info(colors.green(`\t\t\t\t* rendering`));
    return this.component.render({ features });
  }
};