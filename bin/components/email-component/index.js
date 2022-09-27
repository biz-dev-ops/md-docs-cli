const pug = require('pug');
const files = require('../../utils/files');

module.exports = class EmailComponent {
    constructor({ emailComponentRenderFn }) {
        this.renderFn = emailComponentRenderFn ?? pug.compile(files.readFileAsStringSync(`${__dirname}/template.pug`));
    }

    render(data) {
        return this.renderFn({ data });
    }
}
