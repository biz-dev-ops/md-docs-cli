const fs = require('fs');
const path = require('path');
const chalk = require('chalk-next');
const plantuml = require('node-plantuml');
const { cwd } = require('process');

const AnchorParser = require('../anchor-parser');

module.exports = class UmlAnchorParser extends AnchorParser {
  constructor(options) {
    super(options);
  
    this.root = options?.root;
  }

  _canParse(anchor) { return anchor.href.endsWith('.puml'); }

  async _render(file, anchor) {
    const svgFile = `${file}.svg`;    
    console.info(chalk.green(`\t\t\t\t* creating ${path.relative(this.root, svgFile)}`));

    const uml = await this._readFileAsString(file);

    const generator = plantuml.generate(uml, { format: 'svg' });
    generator.out.pipe(fs.createWriteStream(svgFile));

    return `<img src='${path.relative(cwd(), svgFile)}' alt='${anchor.text}' />`;
  }

  async _parse(anchor) {
    console.info(chalk.green(`\t\t\t\t* changing href`));   

    anchor.href += '.svg';
  }
};