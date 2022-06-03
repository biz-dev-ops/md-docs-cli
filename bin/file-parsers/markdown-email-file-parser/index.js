const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk-next');
const jsdom = require('jsdom');
const md = require('markdown-it')
    ({
        html: true,
        linkify: true,
        typographer: true
    })
    .use(require('markdown-it-task-lists'));
    
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
        console.info(chalk.green(`\t* render html`));
        await this.#renderHtml(file);
    }

    async #renderHtml(file) {
        const htmlFile = `${file}.html`;
        console.info(chalk.green(`\t\t* creating ${path.relative(this.options.dst, htmlFile)}`));

        const root = this.relative.get().root;
        const markdown = await files.readFileAsString(file);
        const response = await this.#renderMarkdown(markdown);
        
        const html = this.component.render({
            title: formatTitle(path.basename(file)),
            root: root,
            locale: await this.locale.get(),
            googleFont: 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&display=swap',
            from: response.from,
            to: response.to,
            subject: response.subject,
            message: response.message,
            attachments: response.attachments,
            footer: this.options.message.footer,
            sender: response.sender
        });

        await fs.writeFile(htmlFile, html);
    }

    async #renderMarkdown(markdown) {
        const response = { from: null, to: null, subject: null, message: null, attachments: null };
        const element = await this.#renderMarkdownAsElement(markdown);
        
        const from = element.querySelector('from');
        if (from) {
            response.from = {
                name: from.querySelector('name')?.innerHTML,
                email: from.querySelector('email').innerHTML
            }
            
            from.parentNode.removeChild(from);
        }

        const to = element.querySelector('to');
        if (to) {
            response.to = {
                name: to.querySelector('name')?.innerHTML,
                email: to.querySelector('email').innerHTML
            }
            
            to.parentNode.removeChild(to);
        }

        const subject = element.querySelector('subject');
        if (subject) {
            response.subject = subject.innerHTML;
            
            subject.parentNode.removeChild(subject);
        }
    
        const attachments = element.querySelector('ul.attachments');
        if (attachments) {
            response.attachments = Array
                .from(attachments.querySelectorAll('li'))
                .map(li => li.innerHTML);
            
            attachments.parentNode.removeChild(attachments);
        }
    
        response.message = element.innerHTML;
        
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