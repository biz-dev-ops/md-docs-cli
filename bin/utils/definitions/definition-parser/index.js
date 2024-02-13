module.exports = class DefinitionParser {
    constructor({ definitionStore }) {
        this.definitionStore = definitionStore;
    }

    async parse(html) {
        const definitions = await this.definitionStore.get();
        
        for (const definition of definitions) {
            const regex = new RegExp(`(<a.*?<\/a>)|(<abbr.*?<\/abbr>)|(${definition.name})`, 'imgs');
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
        const definitions = await this.definitionStore.get();
        for (const definition of definitions) {
            const regex = new RegExp(`({{\\s*(${definition.name})\\s*}})`, 'img');

            template = template.replace(regex, definition.html);
        }
        return template;
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

// function createAlias(definition) {
//     const aliasses = [ definition.name ];
//     if (definition.alias)
//         aliasses.push(...definition.alias);
    
//     const alias = aliasses
//         .sort()
//         .reverse()
//         .map(a => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
//         .join('|');
    
//     return alias;
// }