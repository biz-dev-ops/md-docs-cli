const fs = require('fs').promises;
const path = require('path');
const jsdom = require('jsdom');
const chalk = require('chalk-next');
const files = require('../file/files');

const PageComponent = require('./page-component');

module.exports = class MarkdownFileParser {
    constructor(options) {
        this.root = options.root;
        this.menu = options.menu;
        this.git = options.git;
        this.renderer = options.renderer;
        this.component = new PageComponent(options?.template);
    }

    async parse(file) {
        if (!file.endsWith('.md') && !path.basename(file).startsWith('_'))
            return;
        
        const htmlFile = `${file.slice(0, -3)}.html`;        
        console.info(chalk.green(`\t* creating ${path.relative(this.root, htmlFile)}`));
        
        const html = await this.#render(file);
        
        await fs.writeFile(htmlFile, html);
        
        console.info(chalk.green(`\t* deleting ${path.relative(this.root, file)}`));        
        await fs.unlink(file);
    }
    
    async #render(file) {
        const markdown = await files.readFileAsString(file);
        const html = await this.renderer.render(markdown);
        return this.component.render({
            root: this.root,
            sourceFile: path.relative(this.root, file),
            content: html,
            title: getTitle(html, file),
            menu: this.menu,
            git: this.git,
        });
    }
}

getTitle = function (html, file) {
    const element = jsdom.JSDOM.fragment('<div></div>').firstElementChild;
    element.innerHTML = html;

    let title = element.querySelector('h1')?.text ?? getNameFromFile(file);    

    if (title === 'dist')
        title = 'home';

    if (title.indexOf('.') > -1)
        title = title.substring(0, title.indexOf('.'))

    return title.charAt(0).toUpperCase() + title.slice(1)
        .replace('-', ' ');
}

getNameFromFile = function(file) {
    if(file.endsWith('index.md')) {
        return path.basename(path.dirname(file));
    }
    else {    
        return path.basename(file);
    }
}