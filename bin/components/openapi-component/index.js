const pug = require('pug');
const files = require('../../utils/files');

module.exports = class OpenapiComponent {
    constructor(template) {
        this.renderFn = pug.compile(template ?? files.readFileAsStringSync(`${__dirname}/template.pug`));
    }

    render(data) {
        return this.renderFn(data);
    }
}