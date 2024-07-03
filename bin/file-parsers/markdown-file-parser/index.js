const fs = require('fs').promises;
const { env } = require('process');
const path = require('path');
const colors = require('colors');
const mustache = require('mustache');
const files = require('../../utils/files');
const yaml = require('js-yaml');

module.exports = class MarkdownFileParser {
    #definitions = null;

    constructor({ options, gitInfo, hosting, markdownRenderer, pageComponent, menu, locale, htmlParsers, pageUtil, definitionStore }) {
        this.options = options;
        this.gitInfo = gitInfo;
        this.hosting = hosting;
        this.renderer = markdownRenderer;
        this.component = pageComponent;
        this.menu = menu;
        this.locale = locale;
        this.parsers = htmlParsers;
        this.pageUtil = pageUtil;
        this.definitionStore = definitionStore;
    }

    async parse(file) {
        if (!(file.endsWith('.md') && !file.endsWith('.message.md') && !file.endsWith('.email.md')))
            return;

        console.info(colors.yellow(`parsing ${path.relative(this.options.dst, file)}`));

        const htmlFile = `${file.slice(0, -3)}.html`;

        console.info(colors.green(`\t* creating ${path.relative(this.options.dst, htmlFile)}`));

        const html = await this.#render(file);

        await fs.writeFile(htmlFile, html);
    }

    async #render(file) {
        const data = await this.#getData(file);
        const markdown = await files.readFileAsString(file);
        const element = await this.renderer.render(mustache.render(markdown, data));
       
        if (env.NODE_ENV === 'development')
            await fs.writeFile(`${file}.html`, element.outerHTML);

        for (const parser of this.parsers) {
            await parser.parse(element, file);
        }

        if (env.NODE_ENV === 'development')
            await fs.writeFile(`${file}.parsed.html`, element.outerHTML);
        
        const logout = this.#getlogoutInfo(this.options, file);
        const showNav = this.#getShowNavInfo(this.options, file);
        const menuItems = await this.menu.items(file);

        return this.component.render({
            baseHref: this.pageUtil.relativeBaseHref(),
            root: this.pageUtil.relativeRootFromBaseHref(),
            showNav: showNav,
            logout: logout,
            content: element.innerHTML,
            title: data.title,        
            git: this.gitInfo,
            gitSourceFile: mustache.render(this.gitInfo.branch.url, { file: path.relative(this.options.dst, file) }),
            options: this.options.page || {},
            menu: menuItems,
            locale: await this.locale.get()
        });
    }

    async #getData(file) {
        if(!this.#definitions) {
            this.#definitions = (await this.definitionStore.get())
                .reduce((result, definition) => { 
                    result[definition.name.replaceAll(" ", "_").toLowerCase()] = definition.text;
                    return result;
                }, {});
        }

        let data = {
            title: await this.#getTitle(file),
            definitions: this.#definitions
        };

        const ymlFile = `${file}.yml`;    
        if (await files.exists(ymlFile)) {
            data = Object.assign(data, yaml.load(await files.readFileAsString(ymlFile)));
        }

        return data;
    }

    async #getTitle(file) {
        const urlTitle = this.pageUtil.getTitleFromUrl(file);
        const markdownTitle = await this.pageUtil.getTitleFromMarkdown(file);
        if(!markdownTitle) {
            return urlTitle;
        }
        return mustache.render(markdownTitle, { title: urlTitle });
    }

    #getShowNavInfo(options, file) {
        if (file.endsWith('401.md') || file.endsWith('403.md'))
            return false;
        
        return true;
    }

    #getlogoutInfo(options, file) { 
        if (file.endsWith('401.md') || file.endsWith('403.md') || file.endsWith('404.md'))
            return null;

        if (!('hosting' in options) ||
            !('routes' in options.hosting) ||
            !('logout' in options.hosting.routes)) {
            return null;
        }

        return options.hosting.routes.logout;
    }
}
