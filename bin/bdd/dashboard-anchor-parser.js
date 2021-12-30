const yaml = require('js-yaml');
const { AnchorParser } = require('../anchor-parser');
const { gherkin } = require('gherkin');
const { specflow } = require('specflow');
const { summarizer } = require('summarizer');
const { component } = require('dashboard-component');

module.exports = class DasboardAnchorParser extends AnchorParser {
  constructor(executions) {
    this.executions = executions;
  }

  canParse(anchor) { return anchor.href.endsWith(".dashboard.yml"); }

  async render(file) {
    const config = await parseFile(file);
    const features = await gherkin.parse(config.features);
    specflow.parse(features, this.executions);
    const summary = summarizer.summarize(features);
    return component.render(summary, features);
  }

  async parseFile(file) {
    const data = await readFileAsString(file);
    const json = yaml.load(data);
    return json;
  }
};