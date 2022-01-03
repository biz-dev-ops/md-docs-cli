const fs = require('fs').promises;
const path = require('path');
const jsdom = require('jsdom');
const chalk = require('chalk-next');
const files = require('../file/files');

const PageComponent = require('./page-component');

module.exports = class MarkdownFileParser {
    constructor(options) {
        this.menu = options.menu;
        this.git = options.git;
        this.renderer = options.renderer;
        this.component = new PageComponent(options?.template);
    }

    async parse(file, root) {
        if (!file.endsWith('.md') && !path.basename(file).startsWith('_'))
            return;
        
        const htmlFile = `${file.slice(0, -3)}.html`;        
        console.info(chalk.green(`\t* creating ${htmlFile}`));
        
        let html = await this.#render(file);
        const title = getTitle(html, file);            
        html = this.component.render(root, path.relative(root, file), html, title, this.menu, this.git);

        await fs.writeFile(htmlFile, html);

        console.info(chalk.green(`\t* created ${htmlFile}`));
        
        console.info(chalk.green(`\t* deleting ${file}`));        
        await fs.unlink(file);
    }
    
    async #render(file) {
        const markdown = await files.readFileAsString(file);
        return await this.renderer.render(file, markdown);
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