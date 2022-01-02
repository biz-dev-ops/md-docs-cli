const pug = require('pug');
const files = require('../file/files');

module.exports = class PageComponent {
    constructor(options) {
        this.renderFn = pug.compile(options?.template ?? files.readFileAsStringSync(`${__dirname}/bpmn-component.pug`));
    }
    
    render() {
        return this.renderFn();
    }
}