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
    
const files = require('../../utils/files');

module.exports = class MarkdownEmailFileParser {
    constructor({ options, emailComponent, locale, relative }) {
        this.options = options;
        this.component = emailComponent;
        this.locale = locale;
        this.relative = relative;
    }

    async parse(file) {
        if (!(file.endsWith('.email.md')))
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

        const html = this.component.render({ data });

        await fs.writeFile(htmlFile, html);
    }

    async #createData(file) {
        let data = Object.assign(JSON.parse(JSON.stringify(this.options.email)), {
            locale: await this.locale.get(),
            root: this.relative.get().root,
            title: formatTitle(path.basename(file))
        });

        const ymlFile = `${file}.yml`;    
        if (await files.exists(ymlFile)) {
            data = Object.assign(data, yaml.load(await files.readFileAsString(ymlFile)));
        }

        data.message = await renderMessage(file, data);
        return data;
    }
}

renderMessage = async function(file, data) {
    let markdown = await files.readFileAsString(file);
    markdown = mustache.render(markdown, data);
    return md.render(markdown);
}

formatTitle = function (title) {
    if (title === "dist")
        title = "home";

    if (title.indexOf(".") > -1)
        title = title.substring(0, title.indexOf("."))

    return title.charAt(0).toUpperCase() + title.slice(1)
        .replace("-", " ");
}