module.exports = class HtmlParser {
    constructor(options) {
        this.parsers = options.parsers
    }

    parse(html) {
        const element = JSDOM.fragment("<div></div>").firstElementChild;
        element.innerHTML = html;
        
        for (const parser of this.parsers) {
            await parser.parse(element);
        }

        return element.innerHTML;
    }
}