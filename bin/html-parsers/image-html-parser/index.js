const chalk = require('chalk-next');
const ImageComponent = require('../../components/image-component');
const HtmlParser = require('../html-parser');

module.exports = class ImageHtmlParser extends HtmlParser {
    constructor(options) { 
        super();

        this.component = new ImageComponent(options?.template);
    }

    async parse(element) {
        const elements = element.querySelectorAll('img,svg[data-generator=markdown]');

        if (elements.length === 0) {
            console.info(chalk.green(`\t* html contains no image elements`));
            return;
        }

        console.info(chalk.green(`\t* parsing ${elements.length} image elements:`));

        for (const element of elements) {
            console.info(chalk.green(`\t\t* parsing ${element.nodeName}`));            

            const html = this.component.render({
                html: element.outerHTML,
                align: getAlign(element)
            });
            
            this._replace(element, html);
        }
    }
}

getAlign = function (element) {
    const url = new URL(`https://example.org/${element.getAttribute('src')}`);

    const align = url.searchParams.get('align');
    return align;
}