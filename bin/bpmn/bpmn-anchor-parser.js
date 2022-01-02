const AnchorParser = require('../html/anchor-parser');

const component = require('./bpmn-component');

module.exports = class BpmnAnchorParser extends AnchorParser {
  constructor() {
    super();

  }

  _canRender(anchor) { return anchor.href.endsWith(".bpmn"); }

  async _render(file) {
    return component.render();
  }
};