const chalk = require('chalk-next');

const HtmlParser = require('../html-parser');

module.exports = class UnsortedListHtmlParser extends HtmlParser {
    constructor({ tabsComponent, locale }) {
        super();

        this.component = tabsComponent;
        this.locale = locale;
    }

    async parse(element) {
        const locale = await this.locale.get();
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

            const tabs = getTabs(ul, id).map(t => {
                if (t.text === 'context')
                    t.text = locale.context;
                
                return t;
            });

            console.info(chalk.green(`\t\t\t* rendering ${tabs.length} tabs`));
            const html = this.component.render({ tabs });

            console.info(chalk.green(`\t\t\t* replacing ul with tabs`));
            this._replace(ul, html);
        }
    }
}

function getContextTab(ul, id) {
    let prev = ul.previousSibling;
    while (prev && prev.nodeName === "#text") {                
        prev = prev.previousSibling;
    }
    
    if(!prev || prev.nodeName !== "DIV" || !prev.classList.contains('context'))
        return null;
    
    prev.parentNode.removeChild(prev);
    
    return {
        id: `${id}-context`,
        text: 'context',
        html: prev.innerHTML
    }
}

getTabs = function (ul, id) {
    const tabs = Array.from(ul.childNodes)
        .filter(child => child.nodeName === 'LI')
        .map((li, index) => {
            const text = getText(li, index);
            
            return {
                id: `${id}-${makeUrlFriendly(text)}`,
                text: text,
                html: li.innerHTML
            };
        });
    
    const contextTab = getContextTab(ul, id);
    if (contextTab)
        tabs.unshift(contextTab);
    
    return tabs;        
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

function getText(li, index) {
    const anchor = li.querySelector('a.replaced');
    if (anchor != undefined)
        return anchor.text;
    
    const child = li.firstChild;
    if (child.nodeName === 'IMG')
        return child.getAttribute('alt');
    
    return `tab-${index}`;
}