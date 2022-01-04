const chalk = require('chalk-next');
const jsdom = require('jsdom');
const path = require('path');
const files = require('../../utils/files');
const { cwd } = require('process');

module.exports = class AnchorParser {
    constructor(options) { }

    async parse(anchor) {
        if (!this._canParse(anchor))
            return;
        
        console.log(chalk.green(`\t\t\t* [${this.constructor.name}]:`));
        
        const file = path.resolve(cwd(), `${anchor.href}`);
    
        const html = await this._render(file);

        if(html != undefined)
            replace(anchor, html);
        
        await this._parse(anchor);
    }

    //Abstract methods
    _canParse(anchor) { throw new Error('not implemented') };
    async _parse(anchor) { };
    async _render(file) { return null; };

    //Proteced methods
    async _readFileAsString(file, encoding = "utf8") { return await files.readFileAsString(file, encoding); };
}

const replace = function (el, fragment) {
    if (typeof fragment === 'string')
        fragment = jsdom.JSDOM.fragment(fragment);

    let ref = el;
    let parent = ref.parentNode;

    if (parent.nodeName === "P") {
        ref = parent;
        parent = ref.parentNode;
    }

    parent.insertBefore(fragment, ref);
    el.classList.add("replaced");
}