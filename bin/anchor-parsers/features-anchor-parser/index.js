const fs = require('fs').promises;
const { env } = require('process');
const yaml = require('js-yaml');
const chalk = require('chalk-next');
const path = require('path');

const AnchorParser = require('../anchor-parser');

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
    console.info(chalk.green(`\t\t\t\t* parsing file`));
    const directory = path.dirname(file);
    const config = await this.#parseFile(file);
    const files = config.map(feature => path.resolve(directory, feature));

    console.info(chalk.green(`\t\t\t\t* parsing ${files.length} features`));
    const features = await gherkin.parse(files);
    const executions = await this.testExecutionParser.get();
    
    console.info(chalk.green(`\t\t\t\t* parsing executions file`));    
    specflow.parse(features, executions);
    
    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.json`, JSON.stringify(features));

    console.info(chalk.green(`\t\t\t\t* rendering`));
    return this.component.render({ features });
  }

  async #parseFile(file) {
    const content = await this._readFileAsString(file);
    const json = yaml.load(content);
    return json;
  }
};