const PUG = require('pug');
const TEMPLATE = require('dashboard-component.pug')

module.exports = class FeatureComponent {
    constructor() {
        this.template = PUG.compile(TEMPLATE);
    }
    
    render(summary) {
        return this.template({ data: summary });
    }
}