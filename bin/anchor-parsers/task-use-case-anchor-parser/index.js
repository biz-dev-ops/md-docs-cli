const fs = require('fs').promises;
const { env } = require('process');
const colors = require('colors');

const files = require('../../utils/files');

const AnchorParser = require('../anchor-parser');

module.exports = class TaskUseCaseAnchorParser extends AnchorParser {
  _extensions = [ ".task.yml", ".task.yaml"];

  constructor({ taskUseCaseComponent }) {
    super();

    this.component = taskUseCaseComponent;
  }

  _canParse(anchor) { return this._extensions.some(extension => anchor.href.endsWith(extension)); }

  async _parse(anchor, file) {
    const json = JSON.parse(await files.readFileAsString(`${file}.json`));

    console.info(colors.green(`\t\t\t\t* rendering`));
    const html = this.component.render({ json });

    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.html`, html);

    return html;
  }
}