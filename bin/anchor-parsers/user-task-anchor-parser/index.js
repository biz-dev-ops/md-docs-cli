const fs = require('fs').promises;
const { env } = require('process');
const colors = require('colors');

const userTaskParser = require('../../utils/user-task-parser');
const jsonSchemaParser = require('../../utils/json-schema-parser');

const AnchorParser = require('../anchor-parser');

module.exports = class UserTaskAnchorParser extends AnchorParser {
  constructor({ userTaskComponent, definitionParser, locale }) {
    super();

    this.component = userTaskComponent;
    this.definitionParser = definitionParser;
    this.locale = locale;
  }

  _canParse(anchor) { return anchor.href.endsWith('.user-task.yml') || anchor.href.endsWith('.user-task.yaml'); }

  async _parse(anchor, file) {
    console.info(colors.green(`\t\t\t\t* parsing yaml`));
    const json = await this.#getJson(file);
    
    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.json`, JSON.stringify(json));

    console.info(colors.green(`\t\t\t\t* parsing user-task`));
    const userTask = userTaskParser.parse(json);

    userTask.locale = await this.locale.get();

    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.user-task.json`, JSON.stringify(userTask));

    console.info(colors.green(`\t\t\t\t* rendering`));
    const html = this.component.render(userTask);

    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.html`, html);

    return html;
  }

  async #getJson(file) {
    const json = await jsonSchemaParser.parse(file);
    return JSON.parse(await this.definitionParser.render(JSON.stringify(json)));
  }
};