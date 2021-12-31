const yaml = require('js-yaml');
const path = require('path');

const AnchorParser = require('../anchor-parser');

const gherkin = require('./gherkin');
const specflow = require('./specflow');
const summarizer = require('./summarizer');
const component = require('./dashboard-component');

module.exports = class DasboardAnchorParser extends AnchorParser {
  constructor(executions) {
    this.executions = executions;
  }

  _canRender(anchor) { return anchor.href.endsWith('.dashboard.yml'); }

  async _render(file) {
    const directory = path.dirname(file);
    const config = await parseFile(file);
    const features = await gherkin.parse(config.features.map(feature => `${directory}/${feature}`));
    specflow.parse(features, this.executions);
    const summary = summarizer.summarize(features);
    return component.render(summary, features);
  }
};

async function parseFile(file) {
  const content = await _readFileAsString(file);
  const json = yaml.load(content);
  return json;
}