const fs = require('fs').promises;
const { env } = require('process');

const chalk = require('chalk-next');

const AnchorParser = require('../anchor-parser');

const gherkin = require('../../utils/bdd/gherkin-parser');
const specflow = require('../../utils/bdd/specflow-test-executions-parser');

module.exports = class FeatureAnchorParser extends AnchorParser {
  constructor({ options, testExecutionStore, featureComponent }) {
    super();

    this.testExecutionStore = testExecutionStore;
    this.component = featureComponent;
  }

  _canParse(anchor) { return anchor.href.endsWith('.feature'); }

  async _render(file) {
    console.info(chalk.green(`\t\t\t\t* parsing feature file`));
    const features = await gherkin.parse(file);
    const executions = await this.testExecutionStore.get();
    
    console.info(chalk.green(`\t\t\t\t* parsing executions file`));    
    specflow.parse(features, executions);
    
    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.json`, JSON.stringify(features));

    console.info(chalk.green(`\t\t\t\t* rendering`));
    return this.component.render({ features });
  }
};