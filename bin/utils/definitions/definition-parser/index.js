module.exports = class DefinitionParser {
    constructor({ defintionStore }) {
        this.defintionStore = defintionStore;
    }

    async parse(html, root) {
        const defintions = await this.defintionStore.get();

        for (const defintion of defintions) {
            let replacement = '$1';
            
            if (defintion.text)
                replacement = `<abbr title="${defintion.text}">${replacement}</abbr>`;
            
            if(defintion.link)
            {
                let url = defintion.link;
                if (!url.startsWith('http'))
                    url = root + url;
                
                replacement = `<a href="${url}">${replacement}</a>`
            }

            const regex = new RegExp(`(?![^<]*>)(${defintion.alias.join('|')})`, 'img');
            html = html.replace(regex, replacement);
        }

        return html;
    }
}