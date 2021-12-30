const AnchorParser = require('../anchor-parser');

const GHERKIN = require('gherkin');
const SPECFLOW = require('specflow');
const COMPONENT = require('feature-component');

module.exports = class FeatureAnchorParser extends AnchorParser {
  constructor(executions) {
    this.executions = executions;
  }

  _canRender(anchor) { return anchor.href.endsWith(".feature"); }

  async _render(file) {
    const feature = await GHERKIN.parse(file);
    SPECFLOW.parse(feature, this.executions);
    return COMPONENT.render(feature);
  }
};