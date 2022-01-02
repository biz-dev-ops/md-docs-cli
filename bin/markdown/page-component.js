const pug = require('pug');
const files = require('../file/files');

module.exports = class PageComponent {
    constructor(options) {
        this.renderFn = pug.compile(options?.template ?? files.readFileAsStringSync(`${__dirname}/page-component.pug`));
    }
    
    render(source, content, title, menu, git) {
        return this.renderFn({ source, content, title, menu, git });
    }
}