const chalk = require('chalk-next');

module.exports = class AnchorHtmlParser {
    constructor(options) { 
        this.root = options.root;
        this.parsers = options?.parsers ?? [];
    }

    async parse(element) {
        const anchors = Array.from(element.querySelectorAll("a"))
            .filter(a => !a.href.startsWith("http"));
        
        if (anchors.length === 0) {
            console.info(chalk.green(`\t* html contains no anchors`));
            return;
        }            
        
        console.info(chalk.green(`\t* parsing ${anchors.length} anchors:`));
        
        for (const anchor of anchors) {
            console.info(chalk.green(`\t\t* parsing anchor ${anchor.href}:`));
            
            for (const parser of this.parsers) {
                await parser.parse(anchor);
            }
        }
    }
}