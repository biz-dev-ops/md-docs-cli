const files = require('../utils/files');

module.exports = class Locale {
    #locale = null;

    constructor({ options }) {
        this.locale = options.locale ?? 'en';
    }

    async init() {
        await this.get();
    }

    async get() {
        if (this.#locale != null)
            return this.#locale;
        
        const file = `${__dirname}/${this.locale}.json`;
        const content = files.readFileAsStringSync(file);
        this.#locale = JSON.parse(content);
        return this.#locale;
    }
}