const jsdom = require('jsdom');

module.exports = class HtmlParser {
    constructor(options) {
        this.parsers = options.parsers
    }

    async parse(file, html) {
        const element = jsdom.JSDOM.fragment('<div></div>').firstElementChild;
        element.innerHTML = html;
        
        for (const parser of this.parsers) {
            await parser.parse(file, element);
        }

        return element.innerHTML;
    }
}