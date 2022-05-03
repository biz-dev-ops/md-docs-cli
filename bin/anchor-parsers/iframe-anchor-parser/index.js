const chalk = require('chalk-next');
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
    for (const rule of rules) {
      if (name.endsWith(rule))
        return true;
    }      
    return false;
   }

  async _parse(anchor, file) {
    console.info(chalk.green(`\t\t\t\t* rendering iframe`));

    const name = path.basename(file).split('.')[1];
    const hash = await files.hash(file);
  
    return this.iFrameComponent.render({
      name: name,
      src: `./${path.relative(cwd(), file)}.html?_v=${hash}`
    });
  }
};

const rules = [
  '.email.md',
  '.message.md'

  // '.asyncapi.yml',
  // '.asyncapi.yaml',
  // '.openapi.yml',
  // '.openapi.yaml'
]
