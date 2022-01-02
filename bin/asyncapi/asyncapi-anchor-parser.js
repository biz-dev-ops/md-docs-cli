const AnchorParser = require('../html/anchor-parser');

const component = require('./asyncapi-component');

module.exports = class AsyncapiAnchorParser extends AnchorParser {
  constructor() {
    super();
  }

  _canRender(anchor) { return anchor.href.endsWith(".asyncapi.yml"); }

  async _render(file) {
    return component.render();
  }
};