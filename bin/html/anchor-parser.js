const jsdom = require('jsdom');
const path = require('path');
const files = require('../file/files');

module.exports = class AnchorParser {
    constructor() { }

    async parse(src) {
        if (!_canParse(src.anchor))
            return;

        if (this._canRender(src.anchor)) {
            const target = `${path.dirname(src.file)}/${src.anchor.href}`;    
            const html = await _render(target);
            replace(src.anchor, html);
        }

        await _parse(src.anchor);

        console.log(`${this.constructor.name}: executed for ${src.file}`);
    }

    //Proteced methods
    async _readFileAsString(file, encoding = "utf8") { return await files.readFileAsString(file, encoding); };

    //Abstract methods
    _canParse(anchor) { return this._canRender(anchor) };
    
    async _parse(anchor) { };
    
    _canRender(anchor) { throw "abstract method not implemented." };
    
    async _render(file) { throw "abstract method not implemented." };
}

const replace = function (el, fragment) {
    if (typeof fragment === 'string')
        fragment = jsdom.fragment(fragment);

    let ref = el;
    let parent = ref.parentNode;

    if (parent.nodeName === "P") {
        ref = parent;
        parent = ref.parentNode;
    }

    parent.insertBefore(fragment, ref);
    el.classList.add("replaced");
}