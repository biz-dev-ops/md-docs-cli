const pug = require('pug');
const files = require('../../utils/files');

module.exports = class LetterComponent {
    constructor({ letterComponentRenderFn }) {
        this.renderFn = letterComponentRenderFn ?? pug.compile(files.readFileAsStringSync(`${__dirname}/template.pug`));
    }

    render(data) {
        return this.renderFn({ data });
    }
}