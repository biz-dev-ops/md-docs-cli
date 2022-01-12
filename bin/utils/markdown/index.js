const jsdom = require('jsdom');
const markdown_it_anchor = require('markdown-it-anchor');
const md = require('markdown-it')
    ({
        html: true,
        linkify: true,
        typographer: true
    })
    .use(markdown_it_anchor, {  
        permalink: markdown_it_anchor.permalink.linkInsideHeader({
            symbol: "¶"            
        })
    })
    .use(require("markdown-it-multimd-table"))
    .use(require("markdown-it-container"), "info")
    .use(require("markdown-it-container"), "warning")
    .use(require("markdown-it-container"), "error")
    .use(require("markdown-it-toc-done-right"), {
        level: [2,3,4]
    })
    .use(require("markdown-it-plantuml-ex"))
    .use(require("markdown-it-abbr"))
    .use(require("markdown-it-codetabs"))
    .use(require("markdown-it-attrs"));

module.exports = class MarkdownRenderer {
    constructor(options) {
        this.parsers = options.parsers
    }

    async render(markdown) {
        const html = md.render(markdown);
        
        const element = jsdom.JSDOM.fragment('<div></div>').firstElementChild;
        element.innerHTML = html;

        Array.from(element.querySelectorAll('svg')).forEach(svg => {
            svg.setAttribute('data-generator', 'markdown');
        });
        
        for (const parser of this.parsers) {
            await parser.parse(element);
        }

        return element.innerHTML;
    }
}