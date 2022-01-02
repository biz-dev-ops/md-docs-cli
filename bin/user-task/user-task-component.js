const pug = require('pug');
const files = require('../file/files');

module.exports = class UserTaskComponent {
    constructor(options) {
        this.renderFn = pug.compile(options?.template ?? files.readFileAsStringSync(`${__dirname}/user-task-component.pug`));
    }
    
    render() {
        return this.renderFn();
    }
}