
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
        this.parser = options.parser
    }

    async render(markdown) {
        const html = md.render(markdown);
        return await this.parser.parse(html);
    }
}