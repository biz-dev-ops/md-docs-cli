const pug = require('pug');
const files = require('../../utils/files');
const chalk = require("chalk-next");

module.exports = class PageComponent {
    constructor({ options, pageComponentRenderFn }) {
        this.renderFn = pageComponentRenderFn ?? pug.compile(files.readFileAsStringSync(`${__dirname}/template.pug`));
        this.options = options;
    }

    render(data) {
        return this.renderFn({...data });
    }
}
