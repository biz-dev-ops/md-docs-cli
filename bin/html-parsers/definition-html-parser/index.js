const colors = require('colors');
const HtmlParser = require('../html-parser');

module.exports = class DefinitionHtmlParser extends HtmlParser {
    constructor({ definitionParser }) { 
        super();

        this.definitionParser = definitionParser;
    }

    async parse(element) {
        const elements = element
                .querySelector('article')
                .querySelectorAll('p,li,td,th');

        if (elements.length === 0) {
            console.info(colors.green(`\t* html contains no paragraphs`));
            return;
        }

        console.info(colors.green(`\t* parsing ${elements.length} paragraph elements:`));

        for (const element of elements) {
            element.innerHTML = await this.definitionParser.parse(element.innerHTML);
        }
    }
}