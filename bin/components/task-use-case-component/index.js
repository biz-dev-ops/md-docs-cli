const pug = require('pug');
const path = require('path');
const files = require('../../utils/files');

module.exports = class TaskUseCaseComponent {
    constructor({ taskUseCaseComponentRenderFn }) {
        const pugFile = path.resolve(__dirname, `template.pug`);

        this.renderFn = taskUseCaseComponentRenderFn ?? pug.compile(files.readFileAsStringSync(pugFile), { filename: pugFile });
    }

    render(data) {
        return this.renderFn({...data });
    }
}
