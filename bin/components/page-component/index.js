const pug = require('pug');
const files = require('../../utils/files');

module.exports = class PageComponent {
    constructor({ pageComponentRenderFn }) {
        this.renderFn = pageComponentRenderFn ?? pug.compile(files.readFileAsStringSync(`${__dirname}/template.pug`));
    }

    render(data) {
        return this.renderFn({...data });
    }
}
