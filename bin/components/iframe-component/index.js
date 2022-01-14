const pug = require('pug');
const files = require('../../utils/files');

module.exports = class IFrameComponent {
    constructor({ iFrameComponentRenderFn }) {
        this.renderFn = iFrameComponentRenderFn ?? pug.compile(files.readFileAsStringSync(`${__dirname}/template.pug`));
    }
    
    render(data) {
        return this.renderFn(data);
    }
}