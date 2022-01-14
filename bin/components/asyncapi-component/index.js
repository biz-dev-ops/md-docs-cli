const pug = require('pug');
const files = require('../../utils/files');

module.exports = class AsyncapiComponent {
    constructor({ asyncapiComponentRenderFn }) {
        this.renderFn = asyncapiComponentRenderFn ?? pug.compile(files.readFileAsStringSync(`${__dirname}/template.pug`));
    }
    
    render(data) {
        return this.renderFn(data);
    }
}