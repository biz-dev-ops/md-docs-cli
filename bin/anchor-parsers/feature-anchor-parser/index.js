const chalk = require('chalk-next');

const AnchorParser = require('../anchor-parser');

const gherkin = require('../../bdd/gherkin');
const specflow = require('../../bdd/specflow');
const component = require('../../components/feature-component');

module.exports = class FeatureAnchorParser extends AnchorParser {
  constructor(executions) {
    super();
    this.executions = executions;
  }

  _canRender(anchor) { return anchor.href.endsWith(".feature"); }

  async _render(file) {

    const feature = await gherkin.parse(file);
    specflow.parse(feature, this.executions);
    return component.render(feature);
  }
};