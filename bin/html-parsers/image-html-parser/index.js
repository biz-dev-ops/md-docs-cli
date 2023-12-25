const colors = require('colors');
const path = require('path');
const { cwd } = require('process');
const files = require('../../utils/files')

const HtmlParser = require('../html-parser');

module.exports = class ImageHtmlParser extends HtmlParser {
    constructor({ imageComponent }) { 
        super();

        this.component = imageComponent;
    }

    async parse(element) {
        await this.parseImgAndSvg(element);
        await this.parseEmbed(element);
    }

    async parseImgAndSvg(element) {
        const elements = Array.from(element.querySelectorAll('img:not(.replaced),svg[data-generator=markdown]:not(.replaced)'));

        if (elements.length === 0) {
            console.info(colors.green(`\t* html contains no image or svg elements`));
            return;
        }

        console.info(colors.green(`\t* parsing ${elements.length} image or svg elements:`));

        for (let element of elements) {
            console.info(colors.green(`\t\t* parsing ${element.nodeName}`));            

            if (element.parentNode.nodeName === 'A') {
                const parent = element.parentNode;

                const html = this.component.render({
                    html: parent.outerHTML,
                    align: this.#getAlign(element)
                });

                this._replace(parent, html);
            }
            else {
                const html = this.component.render({
                    html: element.outerHTML,
                    align: this.#getAlign(element)
                });

                this._replace(element, html);
            }
        }
    }

    async parseEmbed(element) {
        const elements = Array.from(element.querySelectorAll('embed[type=image\\/svg\\+xml]:not(.replaced)'));

        if (elements.length === 0) {
            console.info(colors.green(`\t* html contains no embed elements`));
            return;
        }

        console.info(colors.green(`\t* parsing ${elements.length} embed elements:`));

        for (let element of elements) {
            console.info(colors.green(`\t\t* parsing ${element.nodeName}`));            

            const svg = await files.readFileAsString(path.resolve(cwd(), element.src));

            const html = this.component.render({
                html: svg,
                align: this.#getAlign(element)
            });

            this._replace(element, html);
        }
    }

    #getAlign (element) {
        const url = new URL(`https://example.org/${element.getAttribute('src')}`);
    
        const align = url.searchParams.get('align');
        return align;
    }
}