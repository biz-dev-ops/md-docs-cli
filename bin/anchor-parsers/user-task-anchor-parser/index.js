const fs = require('fs').promises;
const { env } = require('process');
const chalk = require('chalk-next');

const userTaskParser = require('../../user-tasks/user-task-parser');
const jsonSchemaParser = require('../../utils/json-schema-parser');

const AnchorParser = require('../anchor-parser');
const UserTaskComponent = require('../../components/user-task-component');

module.exports = class UserTaskAnchorParser extends AnchorParser {
  constructor(options) {
    super(options);

    this.component = new UserTaskComponent(options?.template);
  }

  _canParse(anchor) { return anchor.href.endsWith(".user-task.yml"); }

  async _render(file) {
    console.info(chalk.green(`\t\t\t\t* parsing yaml`));
    const json = await jsonSchemaParser.parse(file);

    console.info(chalk.green(`\t\t\t\t* parsing user-task`));
    const userTask = userTaskParser.parse(json);

    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.user-task.json`, JSON.stringify(userTask));

    console.info(chalk.green(`\t\t\t\t* rendering`));
    return this.component.render(userTask);
  }
};