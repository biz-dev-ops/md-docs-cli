const pug = require('pug');
const TEMPLATE = require('feature-component.pug')

module.exports = class FeatureComponent {
    constructor() {
        this.template = pug.compile(TEMPLATE);
    }
    
    render(features) {
        return this.template({ data: features });
    }
}