const pug = require('pug');
const files = require('../../utils/files');
const FeatureComponent = require('../feature-component')

module.exports = class DashboardComponent {
    constructor(template) {
        this.renderFn = pug.compile(template ?? files.readFileAsStringSync(`${__dirname}/template.pug`));
        this.featureComponent = new FeatureComponent();
    }
    
    render(data) {
        const features = this.featureComponent.render(data);
        return this.renderFn({ summary: data.summary, features: features });
    }
}