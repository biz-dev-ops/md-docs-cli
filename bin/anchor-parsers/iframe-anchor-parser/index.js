const colors = require('colors');
const path = require('path');
const { cwd } = require('process');

const AnchorParser = require('../anchor-parser');
const files = require('../../utils/files');

module.exports = class IFrameAnchorParser extends AnchorParser {

  constructor({ iFrameComponent }) {
    super();

    this.iFrameComponent = iFrameComponent;
  }

  _canParse(anchor) { 
    const name = path.basename(anchor.href);
    for (const extension of extensions) {
      if (name.endsWith(extension))
        return true;
    }      
    return false;
   }

  async _parse(anchor, file) {
    console.info(colors.green(`\t\t\t\t* rendering iframe`));

    const name = path.basename(file).split('.')[1];
    const hash = await files.hash(file);
  
    return this.iFrameComponent.render({
      name: name,
      src: `./${path.relative(cwd(), file)}.html?_v=${hash}`
    });
  }
};

const extensions = [
  '.email.md',
  '.message.md',
  '.openapi.yml',
  '.openapi.yaml'
]
