const chalk = require('chalk-next');

const AnchorParser = require('../anchor-parser');

const component = require('../../components/asyncapi-component');

module.exports = class AsyncapiAnchorParser extends AnchorParser {
  constructor() {
    super();
  }

  _canParse(anchor) { return anchor.href.endsWith(".asyncapi.yml"); }

  async _render(file) {
    return component.render();
  }
};