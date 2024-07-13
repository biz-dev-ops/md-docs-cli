const fs = require('fs').promises;
const { env } = require('process');
const path = require('path');
const colors = require('colors');
const yaml = require('js-yaml');
const md = require('markdown-it')
    ({
        html: true,
        linkify: true,
        typographer: true
    })
    .use(require('markdown-it-task-lists'));
const mustache = require('mustache');
const Prince = require("prince");

const files = require('../../utils/files');

module.exports = class MarkdownMessageFileParser {
    constructor({ options, messageComponent, locale, pageUtil }) {
        this.options = options;
        this.component = messageComponent;
        this.locale = locale;
        this.pageUtil = pageUtil;
    }

    async parse(file) {
        if (!(file.endsWith('.message.md')))
            return;
        
        await this.#render(file);
    }

    async #render(file) {
        console.info(colors.green(`\t* render html`));
        
        const htmlFile = `${file}.html`;
        console.info(colors.green(`\t\t* creating ${path.relative(this.options.dst, htmlFile)}`));

        const data = await this.#createData(file);

        if (env.NODE_ENV === 'development')
            await fs.writeFile(`${file}.json`, JSON.stringify(data));

        const html = this.component.render(data);
        await fs.writeFile(`${file}.html`, html);

        await Prince()
            // .inputs(Buffer.from(html`, "utf-8"))
            .inputs(Buffer.from(`${__dirname}/example.html`, "utf-8"))
            .output(`${file}.pdf`)
            .execute();
    }

    async #createData(file) {
        let data = Object.assign(JSON.parse(JSON.stringify(this.options.message || {})), {
            locale: await this.locale.get(),
            baseHref: this.pageUtil.relativeBaseHref(),
            root: this.pageUtil.relativeRootFromBaseHref(),
            title: this.pageUtil.getTitleFromUrl(path.basename(file))
        });

        const ymlFile = `${file}.yml`;    
        if (await files.exists(ymlFile)) {
            const d = yaml.load(await files.readFileAsString(ymlFile)) || {};

            //TODO: check this
            for (const reference of data.references) {
                const found = d.references?.find(r => r.name === reference.name);
                if (found) {
                    reference.value = found.value;
                }
            }

            delete d.references;
            data = Object.assign(data, d);
        }

        data.message = await renderMessage(file, data);
        return data;
    }

    async dispose() {
        if (!this.browser)
            return;
        
        await this.browser.close();        
        this.browser = null;        
    }
}

renderMessage = async function(file, data) {
    let markdown = await files.readFileAsString(file);
    markdown = mustache.render(markdown, data);
    return md.render(markdown);
}
