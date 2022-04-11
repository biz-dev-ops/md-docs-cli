const pug = require('pug');
const files = require('../../utils/files');

module.exports = class GraphViewerComponent {   

    constructor() {
        this.renderFn = pug.compile(files.readFileAsStringSync(`${__dirname}/template.pug`));
        this.script = files.readFileAsStringSync(`${__dirname}/viewer.min.js`);
    }

    render() {
        return this.renderFn({
            script: this.script
        });
    }
}