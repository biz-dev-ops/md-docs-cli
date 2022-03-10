module.exports = class DefinitionParser {
    constructor({ defintionStore }) {
        this.defintionStore = defintionStore;
    }

    async parse(html, root) {
        const defintions = await this.defintionStore.get();

        for (const definition of defintions) {
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

            const alias = [ definition.name ];
            if (definition.alias)
                alias.push(definition.alias);

            const regex = new RegExp(`(?![^<]*>)(${alias.join('|')})`, 'img');
            html = html.replace(regex, replacement);
        }

        return html;
    }
}