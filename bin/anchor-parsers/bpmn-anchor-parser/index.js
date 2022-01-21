const chalk = require('chalk-next');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const AnchorParser = require('../anchor-parser');

module.exports = class BpmnAnchorParser extends AnchorParser {
  constructor({ options, bpmnComponent }) {
    super();

    this.root = options.dst;
    this.component = bpmnComponent;
  }

  _canParse(anchor) { return anchor.href.endsWith('.bpmn'); }

  async _parse(anchor, file) {
    console.info(chalk.green(`\t\t\t\t* rendering`));

    const id = `bpmn-container-${uuidv4()}`;
    const xml = (await this._readFileAsString(file))
      .replace(/(\r\n|\n|\r)/gm, "")
      .replace("'", "\\'");

    return this.component.render({ id, xml, file: path.relative(this.root, file) });
  }
};