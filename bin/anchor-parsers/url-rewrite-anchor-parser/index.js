const path = require('path');
const chalk = require('chalk-next');

const AnchorParser = require('../anchor-parser');

module.exports = class UrlRewriteAnchorParser extends AnchorParser {
  constructor({ options }) {
    super();

    this.root = options.dst;
  }

  _canParse(anchor) { return true; }

  async _parse(anchor, file) {
    const name = path.basename(file);
    for (const rule of rules) {
      if (!name.endsWith(rule[0]))
        continue;

      const rewritten = rewrite(anchor.href, name, rule);
      console.info(chalk.green(`\t\t\t\t* rewriting ${anchor.href} => ${rewritten}`));
      anchor.href = rewritten;
      break;
    }
  }
};

function rewrite(href, name, rule) {
  const newName = `${name.slice(0, rule[0].length * -1)}${rule[1]}`;
  const index = href.lastIndexOf(name);
  return `${href.substring(0, index)}${newName}${href.substring(index + name.length)}`;
}

const rules = [
  ['.drawio', '.drawio.svg'],
  ['.puml', '.puml.svg'],
];