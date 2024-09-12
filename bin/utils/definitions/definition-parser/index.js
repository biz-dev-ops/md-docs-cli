const jsdom = require('jsdom');
const mustache = require('mustache');

module.exports = class DefinitionParser {
    #definitions = null;
    #definitionsDictionary = null;
    #regEx = null;

    constructor({ definitionStore }) {
        this.definitionStore = definitionStore;
    }

    async parse(text) {
        if (!this.#definitions) {
            this.init();
        }

        const element = jsdom.JSDOM.fragment('<div></div>').firstElementChild;
        element.innerHTML = text;

        replaceText(element, (t) => {
            return t.replaceAll(this.#regEx, (match) => {
                const definition = this.#definitions.find(d => d.name.toLowerCase() === match.toLowerCase());

                if (definition) {
                    return createReplacement(definition, match);
                }

                return match;
            });
        });

        return element.innerHTML;
    }

    async render(template) {
        if (!this.#definitions) {
            this.init();
        }

        return mustache.render(template, this.#definitionsDictionary);
    }

    async init() {
        this.#definitions = await this.definitionStore.get();
        this.#definitionsDictionary = this.#definitions
            .reduce((result, definition) => {
                result[definition.name.replaceAll(" ", "_")] = definition.text;
                return result;
            }, {});
        const words = this.#definitions.map(definition => definition.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        this.#regEx = new RegExp(`${words.map(word => `\\b${word}\\b`).join("|")}(?![^<]*>)`, "gmi");
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

function replaceText(element, replaceFunction) {
    if (element.nodeType === 3) {
        const replaced = replaceFunction(element.textContent);
        if(replaced === element.textContent) {
            return;
        }
        const span = jsdom.JSDOM.fragment('<span></span>').firstElementChild
        span.innerHTML = replaced;
        element.replaceWith(span);
    }
    else if (element.hasChildNodes()) {
        for (const child of element.childNodes) {
            replaceText(child, replaceFunction);
        }
    }
}