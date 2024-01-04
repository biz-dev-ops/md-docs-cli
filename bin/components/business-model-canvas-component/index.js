const pug = require('pug');
const path = require('path');
const files = require('../../utils/files');

module.exports = class BusinessModelCanvasComponent {
    constructor({ businessModelCanvasComponentRenderFn }) {
        const pugFile = path.resolve(__dirname, `template.pug`);

        this.renderFn = businessModelCanvasComponentRenderFn ?? pug.compile(files.readFileAsStringSync(pugFile), { filename: pugFile });
    }

    render(data) {
        return this.renderFn({...data });
    }
}
