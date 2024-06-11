const mustache = require('mustache');

module.exports = class DefinitionParser {
    #definitions = null;

    constructor({ definitionStore }) {
        this.definitionStore = definitionStore;
    }

    async parse(html) {
        const definitions = await this.definitionStore.get();
        const words = definitions.map(definition => definition.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const wordsRegEx = new RegExp("\\b(" + words.join("|") + ")\\b", "imgs");
        const innerHTMLRegEx = new RegExp("(?<=<.+.>)(.*?)(?=<.*\/.+.?>)", "imgs");

        return html.replaceAll(innerHTMLRegEx, (innerHTML) => {
            return innerHTML.replaceAll(wordsRegEx, (word) => {
                const definition = definitions.find(d => d.name.toLowerCase() === word.toLowerCase());
                if (definition) {
                    return createReplacement(definition, word);
                }
    
                return word;
            })
        });
    }

    async render(template) {
        if (!this.#definitions) {
            this.#definitions = (await this.definitionStore.get())
                .reduce((result, definition) => {
                    result[definition.name.replaceAll(" ", "_")] = definition.text;
                    return result;
                }, {});
        }

        return mustache.render(template, this.#definitions);
    }
}

function createReplacement(definition, match) {
    let replacement = match;

    if (definition.text) {
        replacement = `<abbr title="${definition.text}">${replacement}</abbr>`;
    }

    if (definition.link) {
        replacement = `<a href="${definition.link}">${replacement}</a>`
    }

    return replacement;
}