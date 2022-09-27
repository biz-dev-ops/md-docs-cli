const pug = require('pug');
const files = require('../../utils/files');

module.exports = class MessageComponent {
    constructor({ messageComponentRenderFn }) {
        this.renderFn = messageComponentRenderFn ?? pug.compile(files.readFileAsStringSync(`${__dirname}/template.pug`));
    }

    render(data) {
        return this.renderFn({ data });
    }
}