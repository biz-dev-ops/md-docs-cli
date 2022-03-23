const fs = require('fs').promises;
const util = require('util');
const path = require('path');
const chalk = require('chalk-next');
const jsdom = require('jsdom');
const md = require('markdown-it')
    ({
        html: true,
        linkify: true,
        typographer: true
    });
const files = require('../../utils/files');
const puppeteer = require('puppeteer');
const moment = require('moment');
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

        moment.locale(this.options.locale);
    }

    async parse(file) {
        if (!(file.endsWith('.message.md')))
            return;
        
        await this.#render(file);
    }

    async #render(file) {
        console.info(chalk.green(`\t* render html`));
        const attachments = await this.#renderHtml(file);

        //console.info(chalk.green(`\t* render pdf`));
        //await this.#renderPDF(file, attachments)

        console.info(chalk.green(`\t* deleting ${path.relative(this.options.dst, file)}`));        
        await fs.unlink(file);
    }

    async #renderHtml(file) {
        const htmlFile = `${file}.html`;
        console.info(chalk.green(`\t\t* creating ${path.relative(this.options.dst, htmlFile)}`));

        const root = this.relative.get().root;
        const cssFile = path.resolve(root, 'assets/style/message/style.css');
        const css = await cssImportResolveAsync({
            ext: 'css',
            pathToMain: cssFile
        });
        
        const markdown = await files.readFileAsString(file);
        const response = await this.#renderMarkdown(markdown);
        
        const html = this.component.render({
            css: css,
            title: formatTitle(path.basename(file)),
            root: root,
            footer: this.options.message.footer,
            googleFont: 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&display=swap',
            locale: await this.locale.get(),
            time: response.time,
            address: response.address,
            sender: response.sender,
            attachments: response.attachments?.map(a => path.parse(a).name),
            content: response.html
        });

        await fs.writeFile(htmlFile, html);

        return response.attachments;
    }

    async #renderPDF(file, attachments) {
        const htmlFile = `${file}.html`;
        const pdfFile = `${file}.pdf`;
        console.info(chalk.green(`\t\t* creating ${path.relative(this.options.dst, pdfFile)}`));
        
        const browser = await puppeteer.launch();

        const page = await browser.newPage();
        await page.goto(`file:${htmlFile}`, { waitUntil: 'networkidle2' });
        await page.pdf({ path: pdfFile, preferCSSPageSize: true, printBackground: true });
        await page.close();

        await browser.close();

        if (attachments) {            
            console.info(chalk.green(`\t\t* adding ${attachments.length} attachments`));
            
            const merger = new PDFMerger();
            merger.add(pdfFile);
            for (const a of response.attachments) {
                const attachment = path.resolve(path.dirname(file), a);
                console.info(chalk.green(`\t\t* adding attachment ${path.relative(attachment, pdfFile)}`));
                merger.add(attachment);                
            }
            await merger.save(pdfFile);
        }
    }

    async #renderMarkdown(markdown) {
        const response = { address: null, sender: null, html: null, time: null, attachments: null };
        const element = await this.#renderMarkdownAsElement(markdown);
        
        const address = element.querySelector('address');
        if (address) {
            response.address = address.innerHTML;
            
            address.parentNode.removeChild(address);
        }

        const sender = element.querySelector('sender');
        if (sender) {
            response.sender = sender.innerHTML;
            
            sender.parentNode.removeChild(sender);
        }
    
        const time = element.querySelector('time');
        if (time) {
            response.time =
            {
                value: time.innerHTML,
                text: moment(time.innerHTML).format('DD MMMM YYYY')
            };
            
            time.parentNode.removeChild(time);
        }
    
        const attachments = element.querySelector('ul.attachments');
        if (attachments) {
            response.attachments = Array
                .from(attachments.querySelectorAll('li'))
                .map(li => li.innerHTML);
            
            attachments.parentNode.removeChild(attachments);
        }
    
        response.html = element.innerHTML;
        
        return response;
    }
    
    async #renderMarkdownAsElement(markdown) {
        const html = md.render(markdown);
    
        const element = jsdom.JSDOM.fragment('<div></div>').firstElementChild;
        element.innerHTML = html;
        return element;
    }
}

formatTitle = function (title) {
    if (title === "dist")
        title = "home";

    if (title.indexOf(".") > -1)
        title = title.substring(0, title.indexOf("."))

    return title.charAt(0).toUpperCase() + title.slice(1)
        .replace("-", " ");
}