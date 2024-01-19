const fs = require('fs').promises;
const colors = require('colors');
const { env } = require('process');

const summarizer = require('../../utils/bdd/features-summarizer');

const AnchorParser = require('../anchor-parser');
const { checkPrimeSync } = require('crypto');

module.exports = class DasboardAnchorParser extends AnchorParser {
    constructor({ dashboardComponent, definitionParser, gherkinParser, compositeFeatureParser }) {
        super();

        this.component = dashboardComponent;
        this.definitionParser = definitionParser;
        this.gherkinParser = gherkinParser;
        this.compositeFeatureParser = compositeFeatureParser;
    }

    _canParse(anchor) { return anchor.href.endsWith('.dashboard.yml') || anchor.href.endsWith('.dashboard.yaml'); }

    async _parse(anchor, file) {
        if (!(file.endsWith('.dashboard.yml') || file.endsWith('.dashboard.yaml')))
            return;

        const files = await this.compositeFeatureParser.parse(file);

        if (env.NODE_ENV === 'development')
            await fs.writeFile(`${file}.files.json`, JSON.stringify(files));

        console.info(colors.green(`\t\t\t\t* parsing feature files`));
        const features = await this.gherkinParser.parse(files);

        if (env.NODE_ENV === 'development')
            await fs.writeFile(`${file}.features.json`, JSON.stringify(features));

        console.info(colors.green(`\t\t\t\t* summarizing features`));
        const summary = summarizer.summarize(features);

        if (env.NODE_ENV === 'development')
            await fs.writeFile(`${file}.json`, JSON.stringify(summary));

        const grouped = this.gherkinParser.group(features);
        const json = { summary, features: grouped };

        if (env.NODE_ENV === 'development')
            await fs.writeFile(`${file}.data.json`, JSON.stringify(json));

        await fs.writeFile(`${file}.json`, JSON.stringify(json));

        console.info(colors.green(`\t\t\t\t* rendering`));
        const html = this.component.render(json);

        if (env.NODE_ENV === 'development')
            await fs.writeFile(`${file}.html`, html);

        return await this.definitionParser.parse(html);
    }
}