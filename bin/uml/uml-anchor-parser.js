const plantuml = require('node-plantuml');
const { streamToString } = require('../util/stream');

const AnchorParser = require('../html/anchor-parser');

module.exports = class UmlAnchorParser extends AnchorParser {
  constructor() {
    super();    
  }

  _canRender(anchor) { return anchor.href.endsWith(".puml"); }

  async _render(file) {
    const uml = await this._readFileAsString(file);

    const generator = plantuml.generate(uml, { format: 'svg' });
    const svg = await streamToString(generator.out);

    return svg;
  }
};