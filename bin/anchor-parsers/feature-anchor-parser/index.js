const fs = require('fs').promises;
const path = require('path');
const md5 = require('md5');
const { env } = require('process');

const colors = require('colors');

const AnchorParser = require('../anchor-parser');

const files = require('../../utils/files');
const gherkin = require('../../utils/bdd/gherkin-parser');
const specflow = require('../../utils/bdd/specflow-test-executions-parser');

module.exports = class FeatureAnchorParser extends AnchorParser {
  constructor({ options, testExecutionParser, featureComponent, definitionParser }) {
    super();

    this.options = options;
    this.testExecutionParser = testExecutionParser;
    this.component = featureComponent;
    this.definitionParser = definitionParser;
  }

  _canParse(anchor) { return anchor.href.endsWith('.feature'); }

  async _parse(anchor, file) {
    console.info(colors.green(`\t\t\t\t* creating hash`));
    const hash = await this.#addHash(file);

    console.info(colors.green(`\t\t\t\t* parsing feature file`));
    let features = await gherkin.parse(file);
    const executions = await this.testExecutionParser.get();
    
    console.info(colors.green(`\t\t\t\t* parsing executions file`));    
    specflow.parse(features, executions);
    
    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.json`, JSON.stringify(features));

    console.info(colors.green(`\t\t\t\t* rendering`));
    const html = this.component.render({ features });
    
    return await this.definitionParser.parse(html);
  }

  async #addHash(file) {
      let feature = await files.readFileAsString(file);
      const hash = md5(path.relative(this.options.dst, file));
      const index = feature.indexOf(':');
      feature = `${feature.substring(0, index)}: ${hash}${feature.substring(index+1)}`;
      await fs.writeFile(file.replace('.feature', '.release.feature'), feature);
      return hash;
  }
};