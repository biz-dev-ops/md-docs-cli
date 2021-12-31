const pug = require('pug');
const files = require('../file/files');

module.exports = class FeatureComponent {
    constructor(options) {
        this.renderFn = pug.compile(options?.template ?? files.readFileAsStringSync(`${__dirname}/dashboard-component.pug`));
    }
    
    render(summary) {
        return this.renderFn({ data: summary });
    }
}