const pug = require('pug');
const files = require('../../utils/files');

module.exports = class BpmnComponent {
    constructor({ bpmnComponentRenderFn }) {
        this.renderFn = bpmnComponentRenderFn ?? pug.compile(files.readFileAsStringSync(`${__dirname}/template.pug`));
    }
    
    render(data) {
        return this.renderFn(data);
    }
}