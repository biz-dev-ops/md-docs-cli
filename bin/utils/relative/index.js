const path = require('path');
const { cwd } = require('process');

module.exports = class Relative {
    constructor({ options }) {
        this.options = options;
    }

    get() {
        return {
            basePath: relativeTo(cwd(), this.options.basePath),
            root: relativeTo(cwd(), this.options.dst)
        }
    }
}

function relativeTo(from, to) {
    const root = path.relative(from, to);
    if (root === '')
        return root;

    return `${root}/`;
}