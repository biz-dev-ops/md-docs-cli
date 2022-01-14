const fs = require('fs');
const path = require('path');
const chalk = require('chalk-next');
const plantuml = require('node-plantuml');
const { cwd } = require('process');

const files = require('../../utils/files');

const AnchorParser = require('../anchor-parser');
const { Socket } = require('dgram');
const { start } = require('repl');

module.exports = class UmlAnchorParser extends AnchorParser {
  constructor({ options }) {
    super();
  
    this.root = options.dst;
  }

  _canParse(anchor) { return anchor.href.endsWith('.puml'); }

  async _parse(anchor, file) {
    const svgFile = `${file}.svg`;    
    console.info(chalk.green(`\t\t\t\t* creating ${path.relative(this.root, svgFile)}`));

    const uml = await this._readFileAsString(file);

    await on(plantuml.generate(uml, { format: 'svg' }).out.pipe(fs.createWriteStream(svgFile)));

    const hash = await files.hash(svgFile);

    console.info(chalk.green(`\t\t\t\t* changing href`));
    anchor.href += `.svg?_v=${hash}`;

    return `<img src='${path.relative(cwd(), svgFile)}?_v=${hash}' alt='${anchor.text}' />`;
  } 
};

async function on(stream) {
  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve());
    stream.on('error', () => reject());
  });
}