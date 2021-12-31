const path = require('path');

const md = require('./markdown-renderer');
const AnchorParser = require('../html/anchor-parser');

module.exports = class MarkdownAnchorParser extends AnchorParser {
  constructor(options) {
    this.htmlParser = options.htmlParser;
  }

  _canParse(anchor) { return path.basename(anchor.href).endsWith('.md') || anchor.href.includes(".md#"); }

  _canRender(anchor) { return _canParse(anchor) && path.basename(anchor.href).startsWith('_'); }

  async _parse(anchor) {
    if(anchor.href.endsWith(".md")) {
        anchor.href = `${anchor.href.substring(0, anchor.href.length - 3)}.html`;
    }
    else {
        anchor.href = anchor.href.replace(".md#", ".html#");
    }
  }

  async _render(file) {
    const markdown = await this._readFileAsString(file);
    const html = md.render(markdown);
    return this.htmlParser.parse(html);
  }
};
