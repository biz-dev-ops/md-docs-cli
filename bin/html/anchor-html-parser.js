const chalk = require('chalk-next');
const path = require('path');

module.exports = class AnchorHtmlParser {
    constructor(options) { 
        this.parsers = options?.parsers ?? [];
    }

    async parse(file, element) {
        const anchors = Array.from(element.querySelectorAll("a"))
            .filter(a => !a.href.startsWith("http"));        
        
        console.info(chalk.green(`\t\t* parsing ${anchors.length} anchors in ${file}`));
        
        for (const anchor of anchors) {
            const anchorFile = path.resolve(file, anchor.href);
            console.log(anchorFile);
            for (const parser of this.parsers) {
                await parser.parse({
                    anchor,
                    file: anchorFile
                });
            }
        }
    }
}