const fs = require('fs').promises;
const { env } = require('process');

const colors = require('colors');

const AnchorParser = require('../anchor-parser');
const specflow = require('../../utils/bdd/specflow-test-executions-parser');

module.exports = class FeatureAnchorParser extends AnchorParser {
  constructor({ options, testExecutionParser, featureComponent, definitionParser, gherkinParser }) {
    super();

    this.options = options;
    this.testExecutionParser = testExecutionParser;
    this.component = featureComponent;
    this.definitionParser = definitionParser;
    this.gherkinParser = gherkinParser;
  }

  _canParse(anchor) { return anchor.href.endsWith('.feature'); }

  async _parse(anchor, file) {
    console.info(colors.green(`\t\t\t\t* parsing feature file`));

    let features = await this.gherkinParser.parse(file);
    const executions = await this.testExecutionParser.get();

    console.info(colors.green(`\t\t\t\t* parsing executions file`));
    specflow.parse(features, executions);

    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.json`, JSON.stringify(features));

    console.info(colors.green(`\t\t\t\t* rendering`));
    const html = this.component.render({ features });

    return await this.definitionParser.parse(html);
  }
};