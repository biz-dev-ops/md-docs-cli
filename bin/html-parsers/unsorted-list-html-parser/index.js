const chalk = require('chalk-next');

const HtmlParser = require('../html-parser');
const TabsComponent = require('../../components/tabs-component');

module.exports = class UnsortedListHtmlParser extends HtmlParser {
    constructor(options) {
        super(options);

        this.component = new TabsComponent(options?.template);
    }

    async parse(element) {
        const uls = Array.from(element.querySelectorAll('ul'))
            .filter(ul => ul.querySelector('.replaced') != undefined);

        if (uls.length === 0) {
            console.info(chalk.green(`\t* html contains no ul's`));
            return;
        }

        console.info(chalk.green(`\t* parsing ${uls.length} ul's:`));

        for (const ul of uls) {
            const id = createUniqueId(ul);
            console.info(chalk.green(`\t\t* parsing ul ${id}:`));

            const tabs = getTabs(ul, id);

            console.info(chalk.green(`\t\t\t* rendering ${tabs.length} tabs`));
            const html = this.component.render({ tabs });

            console.info(chalk.green(`\t\t\t* replacing ul with tabs`));
            this._replace(ul, html);
        }
    }
}

getTabs = function (ul, id) {
    return Array.from(ul.childNodes)
        .filter(child => child.nodeName === 'LI')
        .map((li, index) => {
            const target = li.querySelector('a,img');
            
            return {
                id: `${id}-${makeUrlFriendly(target.text || (target.alt || index.toString()))}`,
                text: target.text ?? target.alt,
                html: li.innerHTML
            };
        });
}

function createUniqueId(element) {
    return getLeadingHeadings(element)
        .reverse()
        .map(e => e.id ?? makeUrlFriendly(e.text))
        .join('-');
}

function getLeadingHeadings(element) {
    const headings = [];
    if (element == undefined)
        return headings;

    let container = element;
    while (container = container.parentNode.closest('.header-container')) {
        headings.push(container.querySelector('h1,h2,h3'));
    }

    return headings;
}

function makeUrlFriendly(value) {
    if (value == undefined)
        return null;

    return encodeURIComponent(value.toLowerCase().replace(/[^a-z0-9_-]+/gi, '-'));
}