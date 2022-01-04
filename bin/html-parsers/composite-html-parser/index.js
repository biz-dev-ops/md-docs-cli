const jsdom = require('jsdom');

module.exports = class CompositeHtmlParser {
    constructor(options) {
        this.parsers = options.parsers
    }

    async parse(html) {
        const element = jsdom.JSDOM.fragment('<div></div>').firstElementChild;
        element.innerHTML = html;
        
        for (const parser of this.parsers) {
            await parser.parse(element);
        }

        return element.innerHTML;
    }
}