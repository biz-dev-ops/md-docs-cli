const mustache = require('mustache');

module.exports = class DefinitionParser {
    #definitions = null;

    constructor({ definitionStore }) {
        this.definitionStore = definitionStore;
    }

    async parse(html) {
        const definitions = await this.definitionStore.get();
        
        for (const definition of definitions) {
            const name = definition.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            const regex = new RegExp(`(<a.*?<\/a>)|(<abbr.*?<\/abbr>)|(${name})`, 'imgs');
            html = html.replaceAll(regex, (match) => {
                if(match.startsWith("<")) {
                    return match;
                }
                return createReplacement(definition, match);
            });
        }

        return html;
    }

    async render(template) {
        if(!this.#definitions) {
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
    
    if(definition.link)
    {
        replacement = `<a href="${definition.link}">${replacement}</a>`
    }
    
    return replacement;
}