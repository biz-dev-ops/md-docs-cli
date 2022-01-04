const pug = require('pug');
const files = require('../../utils/files');

module.exports = class AsyncapiComponent {
    constructor(options) {
        this.renderFn = pug.compile(options?.template ?? files.readFileAsStringSync(`${__dirname}/template.pug`));
    }
    
    render() {
        return this.renderFn();
    }
}