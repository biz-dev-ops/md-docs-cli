const chalk = require('chalk-next');

module.exports = class CleanUpHtmlParser {
    constructor() { }

    async parse(element) {
        const replaced = element.querySelectorAll(".replaced");
        console.log(chalk.green(`\t* removing ${replaced.length} replaced elements`));
        for (const el of replaced) {
            el.parentNode.removeChild(el);
        }

        const paragraphs = element.querySelectorAll("p");
        for (const p of paragraphs) {
            if (p.innerHTML === '') {
                console.log(chalk.green(`\t* removing empty paragraph`));
                p.parentNode.removeChild(p);
            }
        }
    }
}