const colors = require('colors');
const jsdom = require('jsdom');
const path = require('path');
const files = require('../../utils/files');
const { cwd } = require('process');

module.exports = class AnchorParser {
    constructor() { }

    async parse(anchor) {
        const file = path.resolve(cwd(), `${anchor.href.split('?')[0].split('#')[0]}`);

        if (!this._canParse(anchor, file))
            return;
        
        console.info(colors.green(`\t\t\t* [${this.constructor.name}]:`));
        
        const html = await this._parse(anchor, file);
        if (html != undefined)
            replace(anchor, html);
    }

    _canParse(anchor, file) { throw new Error('abstract method not implemented') };
    async _parse(anchor, file) { throw new Error('abstract method not implemented') };
    async _readFileAsString(file, encoding = 'utf8') { return await files.readFileAsString(file, encoding); };
}

const replace = function (el, fragment) {
    if (typeof fragment === 'string')
        fragment = jsdom.JSDOM.fragment(fragment);

    let ref = el;
    let parent = ref.parentNode;

    if (parent.nodeName === 'P') {
        ref = parent;
        parent = ref.parentNode;
    }

    parent.insertBefore(fragment, ref);
    el.classList.add('replaced');
}