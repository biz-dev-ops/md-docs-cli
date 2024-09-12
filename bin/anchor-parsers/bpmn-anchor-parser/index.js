const fs = require('fs').promises;
const { env } = require('process');
const colors = require('colors');

const files = require('../../utils/files');

const AnchorParser = require('../anchor-parser');

module.exports = class BPMNAnchorParser extends AnchorParser {
  
  constructor({ bpmnComponent }) {
    super();

    this.component = bpmnComponent;
  }

  _canParse(anchor, file) { return file.endsWith('.bpmn'); }

  async _parse(anchor, file) {
    const xml = (await files.readFileAsString(file))
      .replace(/[\r\n]+/gm, "")
      .replace(/\"/g, '\\"');
      
    const showProcess = determinShowProcess(anchor); 

    console.info(colors.green(`\t\t\t\t* rendering`));
    const html = this.component.render({ xml, showProcess });

    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.html`, html);

    return html;    
  }
}

determinShowProcess = function(anchor) {
  const parts = anchor.href.split("#");
  if(parts.length == 2)
      return parts[1];

  return null;
}