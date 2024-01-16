const fs = require('fs').promises;
const { env, cwd } = require('process');
const path = require('path');
const colors = require('colors');
const files = require('../../utils/files');

module.exports = class MarkdownFileParser {
    constructor({ options, gitInfo, hosting, markdownRenderer, pageComponent, menu, locale, htmlParsers, pageUtil }) {
        this.options = options;
        this.gitInfo = gitInfo;
        this.hosting = hosting;
        this.renderer = markdownRenderer;
        this.component = pageComponent;
        this.menu = menu;
        this.locale = locale;
        this.parsers = htmlParsers;
        this.pageUtil = pageUtil;
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
        const title = await this.pageUtil.getTitleFromMarkdown(file, true);
        const element = await this.renderer.render(await files.readFileAsString(file));
       
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
            sourceFile: path.relative(this.options.dst, file),
            content: element.innerHTML,
            title: title,        
            git: this.gitInfo,
            options: this.options.page || {},
            menu: menuItems,
            locale: await this.locale.get()
        });
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
