const chalk = require('chalk-next');
const HtmlParser = require('../html-parser');

module.exports = class DefinitionHtmlParser extends HtmlParser {
    constructor({ defintionParser }) { 
        super();

        this.defintionParser = defintionParser;
    }

    async parse(element) {
        console.info(chalk.green(`\t* parsing definitiona`));

        const article = element.querySelector('article');

        article.innerHTML = await this.defintionParser.parse(article.innerHTML);
    }
}