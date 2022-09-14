const fs = require('fs').promises;
const { env } = require('process');
const util = require('util');
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
    
const files = require('../../utils/files');
const puppeteer = require('puppeteer');
const PDFMerger = require('pdf-merger-js');
const cssImportResolve = require('import-resolve');
cssImportResolve[util.promisify.custom] = (options) => {
    return new Promise((resolve, reject) => {
        try {
            cssImportResolve(options, resolve);
        }
        catch (error)
        {
            reject(error);
        }
    })
}
const cssImportResolveAsync = util.promisify(cssImportResolve);

module.exports = class MarkdownMessageFileParser {
    constructor({ options, messageComponent, locale, relative }) {
        this.options = options;
        this.component = messageComponent;
        this.locale = locale;
        this.relative = relative;
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

        const html = this.component.render({ data });

        await fs.writeFile(htmlFile, html);

        //console.info(colors.green(`\t* render pdf`));
        //await this.#renderPDF(file, data);
    }

    async #createData(file) {
        let data = Object.assign(JSON.parse(JSON.stringify(this.options.message)), {
            locale: await this.locale.get(),
            root: this.relative.get().root,
            title: formatTitle(path.basename(file))
        });

        const cssFile = path.resolve(data.root, 'assets/style/message/style.css');
        data.css = await cssImportResolveAsync({
            ext: 'css',
            pathToMain: cssFile
        });

        const ymlFile = `${file}.yml`;    
        if (await files.exists(ymlFile)) {
            const d = yaml.load(await files.readFileAsString(ymlFile)) || {};

            for (const reference of data.references) {
                const found = d.references?.find(r => r.name === reference.name);
                if (found)
                    reference.value = found.value;
            }

            delete d.references;
            data = Object.assign(data, d);
        }

        data.message = await renderMessage(file, data);
        return data;
    }

    async #renderPDF(file, data) {
        const htmlFile = `${file}.html`;
        const pdfFile = `${file}.pdf`;
        console.info(colors.green(`\t\t* creating ${path.relative(this.options.dst, pdfFile)}`));
        
        if(!this.browser)
            this.browser = await puppeteer.launch();

        const page = await this.browser.newPage();
        await page.goto(`file:${htmlFile}`, { waitUntil: 'networkidle2' });
        await page.pdf({ path: pdfFile, preferCSSPageSize: true, printBackground: true });
        await page.close();

        if (data.attachments) {            
            console.info(colors.green(`\t\t* adding ${attachments.length} attachments`));
            
            const merger = new PDFMerger();
            merger.add(pdfFile);
            for (const a of response.attachments) {
                const attachment = path.resolve(path.dirname(file), a);
                console.info(colors.green(`\t\t* adding attachment ${path.relative(attachment, pdfFile)}`));
                merger.add(attachment);                
            }
            await merger.save(pdfFile);
        }
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

formatTitle = function (title) {
    if (title === "dist")
        title = "home";

    if (title.indexOf(".") > -1)
        title = title.substring(0, title.indexOf("."))

    return title.charAt(0).toUpperCase() + title.slice(1)
        .replace("-", " ");
}