const url = require('url');
const chalk = require('chalk-next');
const ImageComponent = require('../../components/image-component');
const HtmlParser = require('../html-parser');

module.exports = class ImageHtmlParser extends HtmlParser {
    constructor(options) { 
        super();

        this.component = new ImageComponent(options?.template);
    }

    async parse(element) {
        const images = element.querySelectorAll('img');

        if (images.length === 0) {
            console.info(chalk.green(`\t* html contains no images`));
            return;
        }

        console.info(chalk.green(`\t* parsing ${images.length} images:`));

        for (const image of images) {
            console.info(chalk.green(`\t\t* parsing ${image.nodeName}`));
            
            const align = null;
            //TODO: const align = image.src ? new url.URL(image.src).searchParams.get('align') : null;

            const html = this.component.render({
                img: image.outerHTML,
                align
            });
            
            this._replace(image, html);
        }
    }
}