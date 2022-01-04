const chalk = require('chalk-next');

const AnchorParser = require('../anchor-parser');

const component = require('../../components/user-task-component');

module.exports = class UserTaskAnchorParser extends AnchorParser {
  constructor() {
    super();
  }

  _canParse(anchor) { return anchor.href.endsWith(".user-task.yml"); }

  async _render(file) {
    return component.render();
  }
};