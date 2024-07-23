const colors = require('colors');
const path = require('path');
const { cwd } = require('process');

const AnchorParser = require('../anchor-parser');
const files = require('../../utils/files');

module.exports = class LetterAnchorParser extends AnchorParser {

  constructor({ iFrameComponent }) {
    super();

    this.iFrameComponent = iFrameComponent;
  }

  _canParse(anchor) { return anchor.href.endsWith('.letter.md') || anchor.href.endsWith('.message.md'); }

  async _parse(anchor, file) {
    console.info(colors.green(`\t\t\t\t* rendering iframe`));

    const name = path.basename(file).split('.')[1];
    const hash = await files.hash(file);
    const data = {
      src: `./${path.relative(cwd(), file)}.html?_v=${hash}`,
      classes: [name]
    };

    if(await files.exists(`${file}.pdf`)) {
      data.classes.push('pdf');
    }
  
    return this.iFrameComponent.render(data);
  }
};