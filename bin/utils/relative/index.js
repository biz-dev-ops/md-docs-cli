const path = require('path');
const { cwd } = require('process');

module.exports = class Relative {
    constructor({ options }) {
        this.options = options;
    }

    get() {
        return {
            basePath: getRelativeBasePath(this.options),
            root: getRelativeRoot(this.options)
        }
    }
}

function getRelativeBasePath(options) {
    const root = path.relative(cwd(), options.basePath);
    if (root === '')
        return root;

    return `${root}/`;
}

function getRelativeRoot(options) {
    const root = path.relative(cwd(), options.dst);
    if (root === '')
        return root;

    return `${root}/`;
}