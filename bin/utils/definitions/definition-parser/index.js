module.exports = class DefinitionParser {
    constructor({ definitionStore, relative }) {
        this.definitionStore = definitionStore;
        this.relative = relative;
    }

    async parse(html) {
        const definitions = await this.definitionStore.get();
        const root = this.relative.get().root;

        for (const definition of definitions) {
            const regex = new RegExp(`(?!<a|abbr[^>]*>)(${createAlias(definition)})(?![^<]*<\/a|abbr>)`, 'img');

            html = html.replace(regex, createReplacement(definition, root));
        }

        return html;
    }

    async render(template) {
        const definitions = await this.definitionStore.get();
        for (const definition of definitions) {
            const regex = new RegExp(`(?![^<]*>)({{${definition.name}}})`, 'img');

            template = template.replace(regex, definition.text);
        }
        return template;
    }
}

function createReplacement(definition, root) {
    let replacement = '$1';
            
    if (definition.text)
        replacement = `<abbr title="${definition.text}">${replacement}</abbr>`;
    
    if(definition.link)
    {
        let url = definition.link;
        if (!url.startsWith('http'))
            url = root + url;
        
        replacement = `<a href="${url}">${replacement}</a>`
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