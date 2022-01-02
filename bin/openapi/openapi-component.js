const pug = require('pug');
const files = require('../file/files');

module.exports = class OpenapiComponent {
    constructor(options) {
        this.renderFn = pug.compile(options?.template ?? files.readFileAsStringSync(`${__dirname}/openapi-component.pug`));
    }
    
    render() {
        return this.renderFn();
    }
}