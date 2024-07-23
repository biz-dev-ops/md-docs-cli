const path = require('path');
const fs = require('fs').promises;
const files = require('../../utils/files');
const AnchorParser = require('../anchor-parser');

module.exports = class PDFAnchorParser extends AnchorParser {
  constructor({ options, pdfComponent, pageUtil }) {
    super();
  
    this.options = options;
    this.component = pdfComponent;
    this.pageUtil = pageUtil;
  }

  _canParse(anchor) { return anchor.href.endsWith('.letter.md') || anchor.href.endsWith('.message.md'); }

  async _parse(anchor, file) {
    const name = path.basename(file).split('.')[1];
    const hash = await files.hash(file);
    const data = await fs.readFile(`${file}.pdf`, {encoding: 'base64'})
  
    return this.component.render({
      name: name,
      src: `/${path.relative(this.options.dst, file)}.pdf?_v=${hash}`,
      data: data,
      root: this.pageUtil.relativeRootFromBaseHref()
    });
  }
};