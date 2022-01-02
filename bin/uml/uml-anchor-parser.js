const AnchorParser = require('../html/anchor-parser');

module.exports = class UmlTaskAnchorParser extends AnchorParser {
  constructor() {
    super();
    
  }

  _canRender(anchor) { return anchor.href.endsWith(".puml"); }

  async _render(file) {
    return component.render();
  }
};