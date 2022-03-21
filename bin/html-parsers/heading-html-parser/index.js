const jsdom = require('jsdom');
const chalk = require('chalk-next');

module.exports = class HeadingHtmlParser {
    constructor({ locale })
    { 
        this.locale = locale;
    }

    async parse(element) {
        const locale = await this.locale.get();
        console.info(chalk.green(`\t* parsing headings:`));

        const container = jsdom.JSDOM.fragment("<article></article>").firstElementChild;
        
        const main = element;
        addToHeadingContainer(locale, main.firstChild, container, -1);
        if (container.childNodes.length > 0) {
            main.appendChild(container);
        }
    }
}

function addToHeadingContainer(locale, element, container, level) {
    while (element) {
        let next = element.nextSibling;
        if (element.localName && element.localName.match(/^h\d{1,}$/)) {
            const newLevel = Number.parseInt(element.localName.substring((1)));

            if (newLevel > level) {
                console.info(chalk.green(`\t\t* parsing ${element.localName || element.nodeName}: creating header container level ${newLevel}`));

                const headerContainer = jsdom.JSDOM.fragment(HEADER_CONTAINER_TEMPLATE(element.localName)).firstElementChild;
                container.appendChild(headerContainer);
                headerContainer.getElementsByClassName("header")[0].appendChild(element);
                next = addToHeadingContainer(locale, next, headerContainer.getElementsByClassName("container")[0], newLevel);
            }
            else {
                console.info(chalk.green(`\t\t* parsing ${element.localName || element.nodeName}: moving to level ${level - 1}`));

                return element;
            }
        }
        else {
            if (level === -1) {
                if (element.localName && element.localName === "nav") {
                    if (element.querySelectorAll("a").length === 0) {
                        console.info(chalk.green(`\t\t* parsing ${element.localName || element.nodeName}: removing element`));
                        element.parentNode.removeChild(element);
                    }
                }
                else {
                    console.info(chalk.green(`\t\t* parsing ${element.localName || element.nodeName}: creating headless container`));

                    const headlessContainer = jsdom.JSDOM.fragment(HEADLESS_CONTAINER_TEMPLATE).firstElementChild;
                    container.appendChild(headlessContainer);
                    next = addToHeadingContainer(locale, element, headlessContainer, 999999);
                }
            }
            else {
                console.info(chalk.green(`\t\t* parsing ${element.localName || element.nodeName}: add element to container`));
                container.appendChild(element);
            }
        }
        element = next;
    }
}

const HEADLESS_CONTAINER_TEMPLATE = `<div class="headless-container"></div>`;

const HEADER_CONTAINER_TEMPLATE = (h) => `<div class="header-container ${h}">
    <div class="header"></div>
    <div class="container"></div>
</div>`;