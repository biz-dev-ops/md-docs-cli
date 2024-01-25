const pug = require('pug');
const path = require('path');
const files = require('../../utils/files');

module.exports = class QueryUseCaseComponent {
    constructor({ queryUseCaseComponentRenderFn }) {
        const pugFile = path.resolve(__dirname, `template.pug`);

        this.renderFn = queryUseCaseComponentRenderFn ?? pug.compile(files.readFileAsStringSync(pugFile), { filename: pugFile });
    }

    render(data) {
        return this.renderFn({...data });
    }
}
