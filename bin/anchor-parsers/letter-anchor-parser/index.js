const path = require('path');
const { cwd } = require('process');
const files = require('../../utils/files');
const AnchorParser = require('../anchor-parser');

module.exports = class PDFAnchorParser extends AnchorParser {
  constructor({ options, pdfComponent }) {
    super();
  
    this.component = pdfComponent;
  }

  _canParse(anchor) { return anchor.href.endsWith('.letter.md') || anchor.href.endsWith('.message.md'); }

  async _parse(anchor, file) {
    const name = path.basename(file).split('.')[1];
    const hash = await files.hash(file);
  
    return this.component.render({
      name: name,
      src: `./${path.relative(cwd(), file)}.pdf?_v=${hash}#view=Fit&toolbar=0&scrollbar=0&navpanes=0`
    });
  }
};