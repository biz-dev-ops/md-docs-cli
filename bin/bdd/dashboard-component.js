const pug = require('pug');
const template = require('./dashboard-component.pug')

module.exports = class FeatureComponent {
    constructor() {
        this.template = pug.compile(template);
    }
    
    render(summary) {
        return this.template({ data: summary });
    }
}