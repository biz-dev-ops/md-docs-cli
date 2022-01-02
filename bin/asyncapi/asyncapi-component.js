const pug = require('pug');
const files = require('../file/files');

module.exports = class AsyncapiComponent {
    constructor(options) {
        this.renderFn = pug.compile(options?.template ?? files.readFileAsStringSync(`${__dirname}/asyncapi-component.pug`));
    }
    
    render() {
        return this.renderFn();
    }
}