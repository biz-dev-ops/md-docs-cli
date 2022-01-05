const fs = require('fs').promises;
const { env } = require('process');
const chalk = require('chalk-next');
const yaml = require('js-yaml');
const path = require('path');

const AnchorParser = require('../anchor-parser');

const gherkin = require('../../bdd/gherkin');
const specflow = require('../../bdd/specflow');
const summarizer = require('../../bdd/summarizer');
const DashboardComponent = require('../../components/dashboard-component');

module.exports = class DasboardAnchorParser extends AnchorParser {
  constructor(options) {
    super();

    this.executions = options?.executions;
    this.component = new DashboardComponent(options?.template);
  }

  _canParse(anchor) { return anchor.href.endsWith('.dashboard.yml'); }

  async _render(file) {
    const directory = path.dirname(file);
    const config = await  this.#parseFile(file);

    console.info(chalk.green(`\t\t\t\t* parsing feature files`));
    const features = await gherkin.parse(config.features.map(feature => path.resolve(directory, feature)));

    console.info(chalk.green(`\t\t\t\t* parsing executions file`));
    specflow.parse(features, this.executions);

    console.info(chalk.green(`\t\t\t\t* summarizing features`));
    const summary = summarizer.summarize(features);

    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.features.json`, JSON.stringify(summary));

    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.json`, JSON.stringify(summary));

    console.info(chalk.green(`\t\t\t\t* creating dashboard`));
    return this.component.render({ summary, features });
  }

  async #parseFile(file) {
    const content = await this._readFileAsString(file);
    const json = yaml.load(content);
    return json;
  }
};