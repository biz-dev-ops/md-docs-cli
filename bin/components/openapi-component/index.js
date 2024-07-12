const pug = require('pug');
const files = require('../../utils/files');

module.exports = class OpenapiComponent {
    constructor({ openapiComponentRenderFn }) {
        this.renderFn = openapiComponentRenderFn ?? pug.compile(files.readFileAsStringSync(`${__dirname}/template.pug`));
    }

    render(data) {
        console.dir(data);
        return this.renderFn(data);
    }
}