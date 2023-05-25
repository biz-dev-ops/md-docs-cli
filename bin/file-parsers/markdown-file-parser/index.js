const fs = require('fs').promises;
const { chdir, cwd } = require('process');
const { env } = require('process');
const path = require('path');
const colors = require('colors');
const files = require('../../utils/files');
const orderPrefixRegex = /(\d+[_])/ig;

module.exports = class MarkdownFileParser {
    constructor({ options, gitInfo, hosting, markdownRenderer, htmlParsers, pageComponent, menu, relative, tocParser, locale }) {
        this.options = options;
        this.gitInfo = gitInfo;
        this.hosting = hosting;
        this.renderer = markdownRenderer;
        this.parsers = htmlParsers;
        this.component = pageComponent;
        this.menu = menu;
        this.relative = relative;
        this.tocParser = tocParser;
        this.locale = locale;
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
        cwdBugFix('#render(file)', file);
        const markdown = await files.readFileAsString(file);
        cwdBugFix('await files.readFileAsString(file)', file);
        const response = getTitle(markdown, file);
        cwdBugFix('getTitle(markdown, file)', file);
        const element = await this.renderer.render(response.markdown);
        cwdBugFix('this.renderer.render(response.markdown)', file);

        if (env.NODE_ENV === 'development')
            await fs.writeFile(`${file}.html`, element.outerHTML);

        for (const parser of this.parsers) {
            cwdBugFix(parser.constructor.name, file);
            await parser.parse(element, file);
        }

        if (env.NODE_ENV === 'development')
            await fs.writeFile(`${file}.parsed.html`, element.outerHTML);
        
        element.innerHTML = element.innerHTML.replace(orderPrefixRegex, '');

        const logout = getlogoutInfo(this.options, file);
        const showNav = getShowNavInfo(this.options, file);
        const menuItems = await this.menu.items(`${path.relative(this.options.dst, file).slice(0, -3)}.html`);

        const url = getRelativeUrl(this.options, file);
        const relative = this.relative.get();
        if (this.hosting.rewrite(url)) {
            relative.root = `/${this.gitInfo.branch.path}`;
        }

        return this.component.render({
            relative: relative,
            showNav: showNav,
            logout: logout,
            sourceFile: getSourceFile(this.options, file),
            url: url,
            content: element.innerHTML,
            title: response.title,        
            git: this.gitInfo,
            options: this.options.page || {},
            menu: menuItems,
            toc: this.tocParser.parse(element),
            locale: await this.locale.get()
        });
    }
}

function cwdBugFix(context, file) {
    if(cwd() != path.dirname(file)) {
        //Bugfix
        console.warn(colors.red(`\t* cwd changed unexpectedly after ${context}: expected ${path.dirname(file)} but found: ${cwd()}`))
        chdir(path.dirname(file));
    }
}

function getShowNavInfo(options, file) {
    if (file.endsWith('401.md') || file.endsWith('403.md'))
        return false;
    
    return true;
}

function getlogoutInfo(options, file) {
    if (file.endsWith('401.md') || file.endsWith('403.md') || file.endsWith('404.md'))
        return null;

    if (!('hosting' in options) ||
        !('routes' in options.hosting) ||
        !('logout' in options.hosting.routes)) {
        return null;
    }

    return options.hosting.routes.logout;
}

function getRelativeUrl(options, file) {
    return `${path.relative(options.dst, file).slice(0, -3)}.html`;
}

function getSourceFile(options, file) {
    const dstFile = path.relative(options.dst, file);
    const srcFile = path.resolve(options.src, dstFile);
    return path.relative(options.src, srcFile);
}

getTitle = function (markdown, file) {
    const response = getTitleFromMarkdown(markdown);
    if (response != undefined)
        return response;

    const title = getTitleFromFile(file);
    return {
        title: formatTitle(title),
        markdown
    };
}

getTitleFromMarkdown = function (markdown) {
    const lines = markdown.split('\n');
    if (lines.length == 0) {
        lines.push(markdown);
    }

    for (const [index, line] of lines.entries()) {
        if (!line.trim().startsWith('# '))
            continue;

        return {
            title: line.trim().substring(2).trim(),
            markdown: lines.filter((_, i) => i != index).join('\n').trim()
        }
    }

    return null;
}

getTitleFromFile = function (file) {
    if (file.endsWith('index.md')) {
        return path.basename(path.dirname(file));
    }
    else {
        return path.basename(file);
    }
}

formatTitle = function (title) {
    if (title === "dist")
        title = "Home";

    if (title.indexOf(".") > -1)
        title = title.substring(0, title.indexOf("."))

    return title.charAt(0).toUpperCase() + title.slice(1)
        .replace("-", " ");
}
