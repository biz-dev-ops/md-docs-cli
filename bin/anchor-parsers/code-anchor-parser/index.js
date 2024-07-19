const colors = require('colors');
const files = require('../../utils/files');

const AnchorParser = require('../anchor-parser');

module.exports = class CodeAnchorParser extends AnchorParser {
  constructor({ options }) {
    super();

    this.root = options.dst;
  }

  _canParse(anchor) { return CODE_LANGUAGES.some(item => anchor.href.endsWith(item.extension)); }

  async _parse(anchor, file) {
    console.info(colors.green(`\t\t\t\t* rendering`));
    
    const language = CODE_LANGUAGES.find(item => anchor.href.endsWith(item.extension)).name;
    const content = (await files.readFileAsString(file))
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return `<pre fullscreen><code class="language-${language}">${content}</code></pre>`;
  }
};

const CODE_LANGUAGES = [
  { name: 'java', extension: '.java' },
  { name: 'csharp', extension: '.cs' },
  { name: 'typescript', extension: '.ts' },
  { name: 'javascript', extension: '.js' },
  { name: 'json', extension: '.json' },
  { name: 'python', extension: '.py' },
  { name: 'yaml', extension: '.data.yml' },
  { name: 'yaml', extension: '.data.yaml' }
];