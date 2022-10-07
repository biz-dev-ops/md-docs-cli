const path = require('path');
const colors = require('colors');

const AnchorParser = require('../anchor-parser');

module.exports = class ImageAnchorParser extends AnchorParser {
  constructor({ options }) {
    super();
  
    this.root = options.dst;
  }

  _canParse(anchor) { return isImage(anchor.href); }

  async _parse(anchor, file) {
    console.info(colors.green(`\t\t\t\t* creating image tag ${path.relative(this.root, file)}`));
    
    return `<img src='${anchor.href}' alt='${anchor.text}' />`;
  } 
};

function isImage(href) {
  return (/\.(gif|jpe?g|tiff?|png|webp|bmp)[\?|#]?.*$/i).test(href)
}