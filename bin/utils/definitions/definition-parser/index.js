module.exports = class DefinitionParser {
    constructor({ definitionStore }) {
        this.definitionStore = definitionStore;
    }

    async parse(html) {
        const definitions = await this.definitionStore.get();

        for (const definition of definitions) {
            const regex = new RegExp(`(?!<a|abbr[^>]*>)(${createAlias(definition)})(?![^<]*<\/a|abbr>)`, 'img');
            html = html.replace(regex, createReplacement(definition));
        }

        return html;
    }

    async render(template) {
        const definitions = await this.definitionStore.get();
        for (const definition of definitions) {
            const regex = new RegExp(`(?![^<]*>)({{\\s*${definition.name}\\s*}})`, 'img');

            template = template.replace(regex, definition.text);
        }
        return template;
    }
}

function createReplacement(definition) {
    let replacement = '$1';
            
    if (definition.text)
        replacement = `<abbr title="${definition.text}">${replacement}</abbr>`;
    
    if(definition.link)
    {
        replacement = `<a href="${definition.link}">${replacement}</a>`
    }
    
    return replacement;
}

function createAlias(definition) {
    const aliasses = [ definition.name ];
    if (definition.alias)
        aliasses.push(...definition.alias);
    
    const alias = aliasses
        .map(a => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|');
    
    return alias;
}