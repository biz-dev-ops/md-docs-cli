const colors = require('colors');

module.exports = class RemoveH1HtmlParser {
    constructor() { }

    async parse(element) {
        const h1 = element.querySelector("h1");
        if(!h1) {
            return;
        }

        console.info(colors.green(`\t* removing h1`));

        h1.remove();
    }
}