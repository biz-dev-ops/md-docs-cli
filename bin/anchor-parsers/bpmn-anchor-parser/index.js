const chalk = require('chalk-next');
const { v4: uuidv4 } = require('uuid');

const AnchorParser = require('../anchor-parser');

const BpmnComponent = require('../../components/bpmn-component');

module.exports = class BpmnAnchorParser extends AnchorParser {
  constructor(options) {
    super(options);

    this.component = new BpmnComponent(options?.template);
  }

  _canParse(anchor) { return anchor.href.endsWith(".bpmn"); }

  async _render(file) {
    console.info(chalk.green(`\t\t\t\t* rendering`));

    const id = `bpmn-container-${uuidv4()}`;
    const xml = (await this._readFileAsString(file))
        .replace(/(\r\n|\n|\r)/gm, "")
        .replace("'", "\'");

    return this.component.render({ id, xml, file });
  }
};