const pug = require('pug');
const files = require('../../utils/files');

module.exports = class FullscreenComponent {
    constructor({ fullscreenComponentRenderFn }) {
        this.renderFn = fullscreenComponentRenderFn ?? pug.compile(files.readFileAsStringSync(`${__dirname}/template.pug`));
    }
    
    render(data) {
        return this.renderFn(data);
    }
}