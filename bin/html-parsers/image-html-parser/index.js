const colors = require('colors');

const HtmlParser = require('../html-parser');

module.exports = class ImageHtmlParser extends HtmlParser {
    constructor({ imageComponent }) { 
        super();

        this.component = imageComponent;
    }

    async parse(element) {
        const elements = element.querySelectorAll('img,svg[data-generator=markdown]');

        if (elements.length === 0) {
            console.info(colors.green(`\t* html contains no image elements`));
            return;
        }

        console.info(colors.green(`\t* parsing ${elements.length} image elements:`));

        for (const element of elements) {
            console.info(colors.green(`\t\t* parsing ${element.nodeName}`));            

            if (element.parentNode.nodeName === 'A') {
                const parent = element.parentNode;

                const html = this.component.render({
                    html: parent.outerHTML,
                    align: getAlign(element)
                });

                this._replace(parent, html);
            }
            else {
                const html = this.component.render({
                    html: element.outerHTML,
                    align: getAlign(element)
                });

                this._replace(element, html);
            }
        }
    }
}

getAlign = function (element) {
    const url = new URL(`https://example.org/${element.getAttribute('src')}`);

    const align = url.searchParams.get('align');
    return align;
}