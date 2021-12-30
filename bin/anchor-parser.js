const JSDOM = require("jsdom");

module.exports = class AnchorParser {
    constructor() { }

    async parse(src) {
        if (_canRender(src.anchor))
            return;
        
        const target = `${src.file.substring(0, src.file.lastIndexOf('/'))}/${src.anchor.href}`;
        
        const html = await _render(target);
        #replace(src.anchor, html);

        console.log(`${this.constructor.name}: executed for ${src.file}`);
    }

    async _readFileAsString(file, encoding = "utf8") {
        const content = await fs.readFile(file);
        return content.toString(encoding);
    }

    _canRender(anchor) { throw "abstract method not implemented." }

    async _render(file) { throw "abstract method not implemented." }

    #replace(el, fragment) {
        if (typeof fragment === 'string')
            fragment = JSDOM.fragment(fragment);
        
        let ref = el;
        let parent = ref.parentNode;
    
        if (parent.nodeName === "P") {
            ref = parent;
            parent = ref.parentNode;
        }
    
        parent.insertBefore(fragment, ref);
        el.classList.add("replaced");
    }
}