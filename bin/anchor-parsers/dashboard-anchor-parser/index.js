const fs = require('fs').promises;
const { env } = require('process');
const colors = require('colors');

const AnchorParser = require('../anchor-parser');

const compositeParser = require('../../utils/bdd/composite-feature-parser');
const gherkin = require('../../utils/bdd/gherkin-parser');
const specflow = require('../../utils/bdd/specflow-test-executions-parser');
const summarizer = require('../../utils/bdd/features-summarizer');

module.exports = class DasboardAnchorParser extends AnchorParser {
  constructor({ testExecutionParser, dashboardComponent, definitionParser }) {
    super();

    this.testExecutionParser = testExecutionParser;
    this.component = dashboardComponent;
    this.definitionParser = definitionParser;
  }

  _canParse(anchor) { return anchor.href.endsWith('.dashboard.yml') || anchor.href.endsWith('.dashboard.yaml'); }

  async _parse(anchor, file) {    
    const files = await compositeParser.parse(file);

    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.files.json`, JSON.stringify(files));

    console.info(colors.green(`\t\t\t\t* parsing feature files`));
    const features = await gherkin.parse(files);
    
    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.features.json`, JSON.stringify(features));
    
    const executions = await this.testExecutionParser.get();

    console.info(colors.green(`\t\t\t\t* parsing executions file`));
    specflow.parse(features, executions);

    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.features.json`, JSON.stringify(features));

    console.info(colors.green(`\t\t\t\t* summarizing features`));
    const summary = summarizer.summarize(features);

    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.json`, JSON.stringify(summary));

    console.info(colors.green(`\t\t\t\t* rendering`));
    const html = this.component.render({ summary, features });
    
    return await this.definitionParser.parse(html);
  }
};