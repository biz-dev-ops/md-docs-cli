const fs = require('fs').promises;
const path = require('path');
const colors = require('colors');
const { env } = require('process');
const { v4: uuidv4 } = require('uuid');
const files = require('../../utils/files');

module.exports = class DMNFileParser {
    #urlsRegex = /url\('#([^')]*)/gm;

    constructor({ options, headlessBrowser, sitemap }) {
        this.options = options;
        this.headlessBrowser = headlessBrowser;
        this.sitemap = sitemap;
    }

    async parse(file) {
        if (!(file.endsWith('.dmn')))
            return;

        const svgFile = `${file}.svg`;
        console.info(colors.green(`\t* creating ${path.relative(this.options.dst, svgFile)}`));

        let svg = await this.#createSvg(file);
        svg = await this.sitemap.link(
            svg,
            "text"
        );

        await fs.writeFile(svgFile, svg);
    }

    async #createSvg(file) {
        const xml = await files.readFileAsString(file);
        const page = await this.#getPage();
        let svg = await page.evaluate(async (xml) => {
            //Executes in context of the page, see viewer.html
            return await convertToSVG(xml);
        }, xml);

        svg = this.#fixReferenceToHiddenElementBug(svg);

        if (env.NODE_ENV === 'development')
            await fs.writeFile(`${file}.raw.svg`, svg);

        return svg;
    }

    #fixReferenceToHiddenElementBug(svg) {
        Array.from(svg.matchAll(this.#urlsRegex)).forEach((match) => {
            const url = match[1];
            svg = svg.replaceAll(url, `${url}-${uuidv4()}`);
        });
        return svg;
    }

    async #getPage() {
        if(this.page) {
            return this.page;
        }

        const script = await files.readFileAsString(require.resolve('dmn-js/dist/dmn-viewer.production.min.js'));

        this.page = await this.headlessBrowser.newPage({
            url: `file://${__dirname}/viewer.html`
        });
        await this.page.addScriptTag({ content: script});
        return this.page;
    }
}