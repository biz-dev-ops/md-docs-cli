const yaml = require('js-yaml');
const AnchorParser = require('../anchor-parser');

const GHERKIN = require('gherkin');
const SPECFLOW = require('specflow');
const SUMMARIZER = require('summarizer');
const COMPONENT = require('dashboard-component');

module.exports = class DasboardAnchorParser extends AnchorParser {
  constructor(executions) {
    this.executions = executions;
  }

  _canRender(anchor) { return anchor.href.endsWith(".dashboard.yml"); }

  async _render(file) {
    const config = await parseFile(file);
    const features = await GHERKIN.parse(config.features);
    SPECFLOW.parse(features, this.executions);
    const summary = SUMMARIZER.summarize(features);
    return COMPONENT.render(summary, features);
  }
};

async function parseFile(file) {
  const yaml = await _readFileAsString(file);
  const json = yaml.load(yaml);
  return json;
}