const files = require('../file/files');

module.exports = class MarkdownFileParser {
    constructor(options) {
        this.menu = options.menu;
        this.git = options.git;
        this.parsers = options.parsers;
    }

    async parse(file) {
        if (!file.endsWith('.md'))
            return;
        
        const markdown = await files.readFileAsString(file);
        
        let html = #render(markdown);

        for (const parser of this.parsers) {
            html = await parser.parse(html);
        }

        await fs.writeFile(`${file.slice(0, -3)}.html`, html);
    }

    #render(markdown) {
        throw 'not implemnted';
    }
}