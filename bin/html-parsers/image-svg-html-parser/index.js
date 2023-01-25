const colors = require('colors');

const HtmlParser = require('../html-parser');

module.exports = class ImageSVGHtmlParser extends HtmlParser {
    constructor() { 
        super();
    }

    async parse(element) {
        const elements = element.querySelectorAll('img[src*=".svg"]');

        if (elements.length === 0) {
            console.info(colors.green(`\t* html contains no image svg elements`));
            return;
        }

        console.info(colors.green(`\t* parsing ${elements.length} image svg elements:`));

        for (const element of elements) {
            console.info(colors.green(`\t\t* parsing ${element.nodeName}`));

            this._replace(element, `<embed type="image/svg+xml" src='${element.src}' alt='${element.alt}' />`)
        }
    }
}