const chalk = require('chalk-next');
const HtmlParser = require('../html-parser');

module.exports = class DefinitionHtmlParser extends HtmlParser {
    constructor({ definitionParser }) { 
        super();

        this.definitionParser = definitionParser;
    }

    async parse(element) {
        const elements = element.querySelectorAll('p,li,td,th');

        if (elements.length === 0) {
            console.info(chalk.green(`\t* html contains no paragraphs`));
            return;
        }

        console.info(chalk.green(`\t* parsing ${elements.length} paragraph elements:`));

        for (const element of elements) {
            element.innerHTML = await this.definitionParser.parse(element.innerHTML);
        }
    }
}