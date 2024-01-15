const colors = require('colors');

module.exports = class RelativeUrlHtmlParser {
    
    constructor({ pageUtil })
    { 
        this.pageUtil = pageUtil;
    }

    async parse(element) {
        console.info(colors.green(`\t* rewrite relative urls to absolute urls`));

        const elements = Array.from(element.querySelectorAll("[href],[src]"))
            .filter(el => !el.closest('svg'));

        console.info(colors.green(`\t\t* found ${elements.length} elements`));

        elements.forEach(el => {
            const url = el.href || el.src;

            console.info(colors.green(`\t\t* url ${url}`));

            if(!url) {
                return;
            }

            const absoluteUrl = this.pageUtil.createAbsoluteUrl(url);

            if(!absoluteUrl) {
                console.info(colors.green(`\t\t* url is not relative`));
                return;
            }

            console.info(colors.green(`\t\t* absolute url ${url}`));

            if(el.href) {
                el.href = absoluteUrl;
            }
            else if(el.src) {
                el.src = absoluteUrl;
            }
        });
    }

    #insideS
}