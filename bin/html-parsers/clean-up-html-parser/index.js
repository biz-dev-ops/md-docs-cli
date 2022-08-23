const colors = require('colors');

module.exports = class CleanUpHtmlParser {
    constructor() { }

    async parse(element) {
        const replaced = element.querySelectorAll(".replaced");
        console.info(colors.green(`\t* removing ${replaced.length} replaced elements`));

        for (const el of replaced) {
            el.parentNode.removeChild(el);
        }

        const paragraphs = Array.from(element.querySelectorAll("p"))
            .filter(p => p.innerHTML === '');

        console.info(colors.green(`\t* removing ${paragraphs.length} empty paragraphs`));

        for (const p of paragraphs) {
            p.parentNode.removeChild(p);
        }
    }
}