const path = require('path');

const files = require('../file/files');
const md = require('./markdown-renderer');
const PageComponent = require('./page-component');

module.exports = class MarkdownFileParser {
    constructor(options) {
        this.menu = options.menu;
        this.git = options.git;
        this.htmlParser = options.htmlParser;
        this.component = new PageComponent(options?.template);
    }

    async parse(file, root) {
        if (!file.endsWith('.md') && !path.basename(file).startsWith('_'))
            return;
        
        let html = await #render(file);
        const title = getTitle(element, file);            
        const html = this.component.render(element.innerHTML, root, title, this.menu, this.git);

        return [{
            location: `${file.slice(0, -3)}.html`,
            content: html
        }];
    }

    #render(file) {
        const markdown = await files.readFileAsString(file);
        const html = md.render(markdown);
        return this.htmlParser.parse(html);
    }
}

getTitle = function(element, file) {
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