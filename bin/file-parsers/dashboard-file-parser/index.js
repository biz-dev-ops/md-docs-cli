const fs = require('fs').promises;
const colors = require('colors');
const { env } = require('process');

const summarizer = require('../../utils/bdd/features-summarizer');

module.exports = class DashboardFileParser {
    constructor({ gherkinParser, compositeFeatureParser }) {
        this.gherkinParser = gherkinParser;
        this.compositeFeatureParser = compositeFeatureParser;
      }

    async parse(file) {
        if (!(file.endsWith('.dashboard.yml') || file.endsWith('.dashboard.yaml')))
            return;

        await this.#parseFeatures(file);
    }

    async #parseFeatures(file) {
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
        
        await fs.writeFile(`${file}.json`, JSON.stringify({ summary, features: grouped }));
    }
}