const colors = require('colors');

const HtmlParser = require('../html-parser');

module.exports = class FullscreenHtmlParser extends HtmlParser {
    constructor({ fullscreenComponent }) {
        super();

        this.component = fullscreenComponent
    }

    async parse(element) {
        Array.from(element.querySelectorAll('code'))
            .filter(e => !hasListAncestor(e))
            .forEach(e => e.parentNode.setAttribute('data-fullscreen', 'fullscreen'));

        const elements = element.querySelectorAll('[data-fullscreen]');

        if (elements.length === 0) {
            console.info(colors.green(`\t* html contains no fullscreen elements`));
            return;
        }

        console.info(colors.green(`\t* parsing ${elements.length} fullscreen elements:`));

        for (const element of elements) {
            element.removeAttribute('data-fullscreen');
            console.info(colors.green(`\t\t* parsing ${element.nodeName}`));

            const html = this.component.render({
                html: element.outerHTML
            });

            this._replace(element, html);
        }
    }
}

function hasListAncestor(element) {
    let currentAncestor = element.parentNode;

    while (currentAncestor) {
      if (currentAncestor.tagName === 'LI') {
        return true;
      }
      currentAncestor = currentAncestor.parentNode;
    }

    return false;
  }