const { AnchorParser } = require('../anchor-parser');
const { gherkin } = require('gherkin');
const { specflow } = require('specflow');
const { component } = require('feature-component');

module.exports = class FeatureAnchorParser extends AnchorParser {
  constructor(executions) {
    this.executions = executions;
  }

  canParse(anchor) { return anchor.href.endsWith(".feature"); }

  async render(file) {
    const feature = await gherkin.parse(file);
    specflow.parse(feature, this.executions);
    return component.render(feature);
  }
};