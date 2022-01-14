const pug = require('pug');
const files = require('../../utils/files');

module.exports = class TabsComponent {
    constructor({ tabsComponentRenderFn }) {
        this.renderFn = tabsComponentRenderFn ?? pug.compile(files.readFileAsStringSync(`${__dirname}/template.pug`));
    }
    
    render(data) {
        return this.renderFn(data);
    }
}