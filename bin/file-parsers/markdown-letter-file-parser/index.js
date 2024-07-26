const fs = require('fs').promises;
const { env, cwd } = require('process');
const path = require('path');
const colors = require('colors');
const yaml = require('js-yaml');
const md = require('markdown-it')
    ({
        html: true,
        linkify: true,
        typographer: true
    })
    .use(require("markdown-it-container"), "call-to-action", {
        render: function (tokens, idx, _options, env, slf) {
            if (tokens[idx].nesting === 1) {
                tokens[idx].attrJoin('class', "block block--call-to-action");
            }

            return slf.renderToken(tokens, idx, _options, env, slf);
        }
    });

const mustache = require('mustache');
const Prince = require("prince");
const Inliner = require("web-resource-inliner");

const files = require('../../utils/files');

module.exports = class MarkdownLetterFileParser {
    constructor({ options, letterComponent, locale, pageUtil }) {
        this.options = options;
        this.component = letterComponent;
        this.locale = locale;
        this.pageUtil = pageUtil;
    }

    async parse(file) {
        if (!(file.endsWith('.letter.md') || file.endsWith('.message.md')))
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

        let html = this.component.render(data);
        if (env.NODE_ENV === 'development')
            await fs.writeFile(`${file}.raw.html`, html);


        html = await this.#inlineFiles(this.options.dst, html);
        await fs.writeFile(`${file}.html`, html);

        try {
            await Prince()
                .inputs(Buffer.from(`${file}.html`, "utf-8"))
                .output(`${file}.pdf`)
                .execute();
        }
        catch (error) {
            console.error(error);
        }
    }

    async #inlineFiles(relativeTo, content) {
        return new Promise((resolve, reject) => {
            try {
                Inliner.html({
                    relativeTo: relativeTo,
                    fileContent: content,
                    images: true,
                    svgs: true,
                    scripts: true,
                    links: true
                }, (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                });
            }
            catch (e) {
                reject(e);
            }
        });
    }

    async #createData(file) {
        let data = Object.assign(JSON.parse(JSON.stringify(this.options.letter || this.options.message || {})), {
            locale: await this.locale.get(),
            baseHref: this.pageUtil.relativeBaseHref(),
            root: this.pageUtil.relativeRootFromBaseHref(),
            title: this.pageUtil.getTitleFromUrl(path.basename(file))
        });

        const ymlFile = `${file}.yml`;
        if (await files.exists(ymlFile)) {
            const d = yaml.load(await files.readFileAsString(ymlFile)) || {};

            // for (const reference of data.references) {
            //     const found = d.references?.find(r => r.name === reference.name);
            //     if (found) {
            //         reference.value = found.value;
            //     }
            // }

            // delete d.references;
            data = Object.assign(data, d);
        }

        data.content = await renderLetter(file, data);
        return data;
    }

    async dispose() {
        if (!this.browser)
            return;

        await this.browser.close();
        this.browser = null;
    }
}

renderLetter = async function (file, data) {
    let markdown = await files.readFileAsString(file);
    markdown = mustache.render(markdown, data);
    return md.render(markdown);
}
