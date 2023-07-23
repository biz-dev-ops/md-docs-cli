const pug = require('pug');
const path = require('path');
const files = require('../../utils/files');

module.exports = class ModelComponent {
    constructor({ modelComponentRenderFn }) {
        const pugFile = path.resolve(__dirname, `template.pug`);

        this.renderFn = modelComponentRenderFn ?? pug.compile(files.readFileAsStringSync(pugFile), { filename: pugFile });
    }

    render(data) {
        return this.renderFn({...data });
    }
}
