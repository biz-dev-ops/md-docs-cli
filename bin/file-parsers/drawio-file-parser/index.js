const fs = require('fs').promises;
const path = require('path');
const colors = require('colors');
const { env } = require('process');
const files = require('../../utils/files');

module.exports = class DrawIOFileParser {
    constructor({ options, headlessBrowser }) {
        this.options = options;
        this.headlessBrowser = headlessBrowser;
    }

    async parse(file) {
        if (!(file.endsWith('.drawio')))
            return;

        const svgFile = `${file}.svg`;
        console.info(colors.green(`\t* creating ${path.relative(this.options.dst, svgFile)}`));

        const svg = await this.#createSvg(file);

        await fs.writeFile(svgFile, svg);
    }

    async #createSvg(file) {
        const xml = await files.readFileAsString(file);
        const page = await this.#getPage();
        const svg = await page.evaluate(async (xml) => {
            //Executes in context of the page, see viewer.html
            return await convertToSVG(xml);
        }, xml);

        if (env.NODE_ENV === 'development')
            await fs.writeFile(`${file}.raw.svg`, svg);

        return svg;
    }

    async #getPage() {
        if(this.page) {
            return this.page;
        }

        const script = await files.readFileAsString(`${__dirname}/viewer.min.js`);

        this.page = await this.headlessBrowser.newPage({
            url: `file://${__dirname}/viewer.html`
        });
        await this.page.addScriptTag({ content: script});
        return this.page;
    }
}