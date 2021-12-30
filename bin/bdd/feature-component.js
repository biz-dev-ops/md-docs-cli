const PUG = require('pug');
const TEMPLATE = require('feature-component.pug')

module.exports = class FeatureComponent {
    constructor() {
        this.template = PUG.compile(TEMPLATE);
    }
    
    render(features) {
        return this.template({ data: features });
    }
}