const fs = require('fs').promises;
const { env } = require('process');
const path = require('path');
const colors = require('colors');
const mustache = require('mustache');
const pug = require('pug');
const yaml = require('js-yaml');
const files = require('../../utils/files');

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
        this.htmlParsers = htmlParsers;
        this.pageUtil = pageUtil;
        this.definitionStore = definitionStore;

        if (!('page' in this.options) ||
            !('headingTemplate' in this.options.page)) {
            this.headingTemplateRenderer = () => null;
        }
        else {
            this.headingTemplateRenderer = pug.compile(this.options.page.headingTemplate);
        }
    }

    async parse(file) {
        if (!(file.endsWith('.md') && !file.endsWith('.letter.md') && !file.endsWith('.message.md') && !file.endsWith('.email.md')))
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
        const body = await this.renderer.render(mustache.render(markdown, data));
        const heading = this.headingTemplateRenderer({...data});
       
        if (env.NODE_ENV === 'development')
            await fs.writeFile(`${file}.html`, body.outerHTML);

        for (const htmlParser of this.htmlParsers) {
            await htmlParser.parse(body, file);
        }

        if (env.NODE_ENV === 'development')
            await fs.writeFile(`${file}.parsed.html`, body.outerHTML);
        
        const logout = this.#getlogoutInfo(file);
        const showNav = this.#getShowNavInfo(file);
        const menuItems = await this.menu.items(file);

        const pageData = {
            baseHref: this.pageUtil.relativeBaseHref(),
            root: this.pageUtil.relativeRootFromBaseHref(),
            showNav: showNav,
            logout: logout,
            content: body.innerHTML,
            title: data.title,
            heading: heading,
            git: this.gitInfo,
            gitSourceFile: mustache.render(this.options.git.urlTemplate, { repository: this.gitInfo.branch.repository, branch: this.gitInfo.branch.name, file: path.relative(this.options.dst, file) }),
            options: this.options.page || {},
            menu: menuItems,
            locale: await this.locale.get(),
            version: this.options.version
        };

        return this.component.render(pageData);
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
            title: await this.#getMarkdownTitle(file),
            definitions: this.#definitions
        };

        const ymlFile = `${file}.yml`;    
        if (await files.exists(ymlFile)) {
            data = Object.assign(data, yaml.load(await files.readFileAsString(ymlFile)));
        }

        data.title = data.title || data.name;
        
        return data;
    }

    async #getMarkdownTitle(file) {
        const markdownTitle = await this.pageUtil.getTitleFromMarkdown(file);
        return markdownTitle;
    }

    #getShowNavInfo(file) {
        if (file.endsWith('401.md') || file.endsWith('403.md'))
            return false;
        
        return true;
    }

    #getlogoutInfo(file) { 
        if (file.endsWith('401.md') || file.endsWith('403.md') || file.endsWith('404.md'))
            return null;

        if (!('hosting' in this.options) ||
            !('routes' in this.options.hosting) ||
            !('logout' in this.options.hosting.routes)) {
            return null;
        }

        return this.options.hosting.routes.logout;
    }
}
