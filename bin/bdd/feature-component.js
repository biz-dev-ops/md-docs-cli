const pug = require('pug');
const template = require('./feature-component.pug')

module.exports = class FeatureComponent {
    constructor() {
        this.template = pug.compile(template);
    }
    
    render(features) {
        return this.template({ data: features });
    }
}