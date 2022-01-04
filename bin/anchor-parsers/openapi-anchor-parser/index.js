const chalk = require('chalk-next');

const AnchorParser = require('../anchor-parser');

const component = require('../../components/openapi-component');

module.exports = class OpenapiAnchorParser extends AnchorParser {
  constructor() {
    super();
    
  }

  _canRender(anchor) { return anchor.href.endsWith(".openapi.yml"); }

  async _render(file) {

    return component.render();
  }
};