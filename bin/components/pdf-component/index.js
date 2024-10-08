const pug = require('pug');
const path = require('path');
const files = require('../../utils/files');

module.exports = class PDFComponent {
    constructor({ pdfComponentRenderFn }) {
        const pugFile = path.resolve(__dirname, `template.pug`);

        this.renderFn = pdfComponentRenderFn ?? pug.compile(files.readFileAsStringSync(pugFile), { filename: pugFile });
    }

    render(data) {
        return this.renderFn({...data });
    }
}