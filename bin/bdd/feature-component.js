const pug = require('pug');
const files = require('../file/files');

module.exports = class FeatureComponent {
    constructor(options) {
        this.renderFn = pug.compile(options?.template ?? files.readFileAsStringSync(`${__dirname}/feature-component.pug`));
    }
    
    render(features) {
        return this.renderFn({ data: features });
    }
}