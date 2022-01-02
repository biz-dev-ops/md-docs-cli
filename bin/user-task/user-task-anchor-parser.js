const AnchorParser = require('../html/anchor-parser');

const component = require('./user-task-component');

module.exports = class UserTaskAnchorParser extends AnchorParser {
  constructor() {
    super();
  }

  _canRender(anchor) { return anchor.href.endsWith(".user-task.yml"); }

  async _render(file) {
    return component.render();
  }
};