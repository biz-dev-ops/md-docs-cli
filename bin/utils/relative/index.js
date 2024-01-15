const path = require('path');
const { cwd } = require('process');

module.exports = class Relative {
    constructor({ options }) {
        this.options = options;
    }

    get() {
        //TODO: deze namen aanpassen kloppen niet, worden gebruikt in page template
        return {
            basePath: this.#relativeTo(this.options.dst, this.options.basePath),
            root: this.#relativeTo(cwd(), this.options.dst)
        }
    }

    #relativeTo(from, to) {
        const root = path.relative(from, to);
        if (root === '')
            return root;
    
        return `${root}/`;
    }
}