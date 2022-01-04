const fs = require('fs');
const path = require('path');
const chalk = require('chalk-next');
const plantuml = require('node-plantuml');
const { cwd } = require('process');

const AnchorParser = require('../html/anchor-parser');

module.exports = class UmlAnchorParser extends AnchorParser {
  constructor(options) {
    super(options);
  
    this.root = options?.root;
  }

  _canRender(anchor) { return anchor.href.endsWith(".puml"); }

  async _parse(anchor) {
    console.info(chalk.green(`\t\t\t\t* changing href`));   

    anchor.href += '.svg';
  }

  async _render(file) {
    const svgFile = `${file}.svg`;    
    console.info(chalk.green(`\t\t\t\t* creating ${path.relative(this.root, svgFile)}`));

    const uml = await this._readFileAsString(file);

    const generator = plantuml.generate(uml, { format: 'svg' });
    generator.out.pipe(fs.createWriteStream(svgFile));

    console.info(chalk.green(`\t\t\t\t* deleting ${path.relative(this.root, file)}`));   
    await fs.promises.unlink(file);

    return `<img src="${path.relative(cwd(), svgFile)}" />`;
  }
};