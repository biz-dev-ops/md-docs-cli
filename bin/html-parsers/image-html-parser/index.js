const url = require('url');
const jsdom = require('jsdom');
const chalk = require('chalk-next');
const ImageComponent = require('../../components/image-component');

module.exports = class ImageHtmlParser {
    //TODO: extend html parser
    constructor(options) { 
        this.component = new ImageComponent(options?.template);
    }

    async parse(element) {
        const images = element.querySelectorAll('img,svg');

        if (images.length === 0) {
            console.info(chalk.green(`\t* html contains no images`));
            return;
        }

        console.info(chalk.green(`\t* parsing ${images.length} images:`));

        for (const image of images) {
            console.info(chalk.green(`\t\t* parsing ${image.nodeName}`));
            
            const align = null;
            //const align = image.src ? new url.URL(image.src).searchParams.get('align') : null;

            const html = this.component.render({
                img: image.outerHTML,
                align
            });
            replace(image, html);
        }
    }
}

//TODO: move to html parser
const replace = function (el, fragment) {
    if (typeof fragment === 'string')
        fragment = jsdom.JSDOM.fragment(fragment);

    let ref = el;
    let parent = ref.parentNode;

    if (parent.nodeName === 'P') {
        ref = parent;
        parent = ref.parentNode;
    }

    parent.insertBefore(fragment, ref);
    el.classList.add('replaced');
}