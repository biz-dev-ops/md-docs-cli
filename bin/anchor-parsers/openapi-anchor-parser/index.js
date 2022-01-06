const fs = require('fs').promises;
const { env, cwd } = require('process');
const path = require('path');
const chalk = require('chalk-next');
const mergeAllOf = require("json-schema-merge-allof");
const refParser = require("@apidevtools/json-schema-ref-parser");

const AnchorParser = require('../anchor-parser');
const OpenapiComponent = require('../../components/openapi-component');
const IFrameComponent = require('../../components/iframe-component');

module.exports = class OpenapiAnchorParser extends AnchorParser {
  constructor(options) {
    super(options);

    this.root = options?.root;
    this.openapiComponent = new OpenapiComponent(options?.template);
    this.iframeComponent = new IFrameComponent(options?.template);
  }

  _canParse(anchor) { return anchor.href.endsWith(".openapi.yml"); }

  async _render(file) {
    console.info(chalk.green(`\t\t\t\t* parsing yaml`));
    const json = mergeAllOfInSchema(await refParser.dereference(file));

    console.info(chalk.green(`\t\t\t\t* rendering page`));
    const html = this.openapiComponent.render({ 
      spec: JSON.stringify(json),
      root: this.root
    });

    const htmlFile = `${file}.html`;

    console.info(chalk.green(`\t\t\t\t* creating ${path.relative(cwd(), htmlFile)}`));
    await fs.writeFile(htmlFile, html);

    console.info(chalk.green(`\t\t\t\t* rendering iframe`));
    return this.iframeComponent.render({
      name: 'openapi',
      src: path.relative(cwd(), htmlFile),
    });
  }
};

mergeAllOfInSchema = (object) =>{
  if(!!object["allOf"]){
      object = mergeAllOf(object);
  }

  for (let key in object) {
      if(typeof object[key] == "object"){
          object[key] = mergeAllOfInSchema(object[key])
      }
  }
  return object;
}