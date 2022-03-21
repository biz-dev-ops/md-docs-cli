const pug = require('pug');
const files = require('../../utils/files');

module.exports = class MenuComponent {
    constructor({ options, menuComponentRenderFn }) {
        this.renderFn = menuComponentRenderFn ?? pug.compile(files.readFileAsStringSync(`${__dirname}/template.pug`));
        this.options = options;
    }

    render(data) {
        return this.renderFn({...data });
    }
}
