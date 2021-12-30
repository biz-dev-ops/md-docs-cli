const jsdom = require("jsdom");

module.exports = class AnchorParser {
    constructor() { }

    async parse(anchor) {
        if (!canParse(anchor))
            return;
        
        const file = relativeFileLocation(file, anchor.href);
        const root = getRelativeRootFromFile(file, root);
        
        const html = await render(file, root);
        replaceWithFragment(jsdom.fragment(html), anchor);

    }

    async readFileAsString(file, encoding = "utf8") {
        const content = await fs.readFile(file);
        return content.toString(encoding);
    }
}