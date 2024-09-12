const colors = require("colors");
const fs = require("fs").promises;
const files = require("../../utils/files")

module.exports = class DefinitionFileParser {
    constructor({ definitionParser }) {
        this.definitionParser = definitionParser;
    }

    async parse(file) {
        if (!(file.endsWith(".yml")))
            return;

        console.info(colors.green(`\t\t\t\t* applying definitions`));

        let content = await files.readFileAsString(file);

        content = await this.definitionParser.render(content);
        
        await fs.writeFile(file, content);
    }
}