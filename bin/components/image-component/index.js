const pug = require('pug');
const files = require('../../utils/files');

module.exports = class ImageComponent {
    constructor({ imageComponentRenderFn }) {
        this.renderFn = imageComponentRenderFn ?? pug.compile(files.readFileAsStringSync(`${__dirname}/template.pug`));
    }
    
    render(data) {
        return this.renderFn(data);
    }
}