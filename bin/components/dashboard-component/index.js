const pug = require('pug');
const jsdom = require('jsdom');
const files = require('../../utils/files');

module.exports = class DashboardComponent {
    constructor({ featureComponent, dashboardComponentRenderFn }) {
        this.renderFn = dashboardComponentRenderFn ?? pug.compile(files.readFileAsStringSync(`${__dirname}/template.pug`));
        this.featureComponent = featureComponent;
    }
    
    render(data) {
        const features = jsdom.JSDOM.fragment(this.featureComponent.render(data)).firstElementChild;
        features.removeAttribute('fullscreen');

        return this.renderFn({ summary: data.summary, features: features.outerHTML });
    }
}

