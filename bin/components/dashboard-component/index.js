const pug = require('pug');
const jsdom = require('jsdom');
const files = require('../../utils/files');
const FeatureComponent = require('../feature-component')

module.exports = class DashboardComponent {
    constructor(template) {
        this.renderFn = pug.compile(template ?? files.readFileAsStringSync(`${__dirname}/template.pug`));
        this.featureComponent = new FeatureComponent();
    }
    
    render(data) {
        const features = jsdom.JSDOM.fragment(this.featureComponent.render(data)).firstElementChild;
        features.removeAttribute('fullscreen');

        return this.renderFn({ summary: data.summary, features: features.outerHTML });
    }
}

