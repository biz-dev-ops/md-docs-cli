const fs = require('fs').promises;
const { env, cwd } = require('process');
const path = require('path');
const chalk = require('chalk-next');
const AsyncApiParser = require("@asyncapi/parser");
const mergeAllOf = require("json-schema-merge-allof");
const refParser = require("@apidevtools/json-schema-ref-parser");

const AnchorParser = require('../anchor-parser');
const AsyncapiComponent = require('../../components/asyncapi-component');
const IFrameComponent = require('../../components/iframe-component');


module.exports = class AsyncapiAnchorParser extends AnchorParser {
  constructor(options) {
    super(options);

    this.root = options.root;
    this.asyncapiComponent = new AsyncapiComponent(options?.template);
    this.iframeComponent = new IFrameComponent(options?.template);

  }

  _canParse(anchor) { return anchor.href.endsWith(".asyncapi.yml"); }

  async _render(file) {
    console.info(chalk.green(`\t\t\t\t* parsing yaml`));
    let json = mergeAllOfInSchema(await refParser.dereference(file));

    try {
      // Does not work without parsed json.
      json = (await AsyncApiParser.parse(json))["_json"];
    }
    catch (ex) {
      console.info(chalk.redBright(`\t\t\t\t* error parsing json`));
      throw new Error(ex);
    }

    console.info(chalk.green(`\t\t\t\t* rendering page`));
    const html = this.asyncapiComponent.render({
      schema: JSON.stringify(json),
      root: this.root
    });

    const htmlFile = `${file}.html`;

    console.info(chalk.green(`\t\t\t\t* creating ${path.relative(cwd(), htmlFile)}`));
    await fs.writeFile(htmlFile, html);

    console.info(chalk.green(`\t\t\t\t* rendering iframe`));
    return this.iframeComponent.render({
      name: 'asyncapi',
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