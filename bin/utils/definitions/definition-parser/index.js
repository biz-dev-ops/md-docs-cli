module.exports = class DefinitionParser {
    constructor({ defintionStore, relative }) {
        this.defintionStore = defintionStore;
        this.relative = relative;
    }

    async parse(html) {
        const defintions = await this.defintionStore.get();
        const root = this.relative.get().root;

        for (const definition of defintions) {
            const regex = new RegExp(`(?![^<]*>)(${createAlias(definition)})`, 'img');

            html = html.replace(regex, createReplacement(definition, root));
        }

        return html;
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