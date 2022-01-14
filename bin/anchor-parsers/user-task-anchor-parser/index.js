const fs = require('fs').promises;
const { env } = require('process');
const chalk = require('chalk-next');

const userTaskParser = require('../../utils/user-task-parser');
const jsonSchemaParser = require('../../utils/json-schema-parser');

const AnchorParser = require('../anchor-parser');

module.exports = class UserTaskAnchorParser extends AnchorParser {
  constructor({ userTaskComponent }) {
    super();

    this.component = userTaskComponent;
  }

  _canParse(anchor) { return anchor.href.endsWith('.user-task.yml') || anchor.href.endsWith('.user-task.yaml'); }

  async _parse(anchor, file) {
    console.info(chalk.green(`\t\t\t\t* parsing yaml`));
    const json = await jsonSchemaParser.parse(file);

    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.json`, JSON.stringify(json));

    console.info(chalk.green(`\t\t\t\t* parsing user-task`));
    const userTask = userTaskParser.parse(json);

    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.user-task.json`, JSON.stringify(userTask));

    console.info(chalk.green(`\t\t\t\t* rendering`));
    const html = this.component.render(userTask);

    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.html`, html);

    return html;
  }
};