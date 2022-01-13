const pug = require('pug');
const files = require('../../utils/files');

module.exports = class FeatureComponent {
    constructor({ featureComponentRenderFn }) {
        this.renderFn = featureComponentRenderFn ?? pug.compile(files.readFileAsStringSync(`${__dirname}/template.pug`));
    }
    
    render(data) {
        return this.renderFn(data);
    }
}