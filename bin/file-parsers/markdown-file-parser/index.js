const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk-next');
const files = require('../../utils/files');

module.exports = class MarkdownFileParser {
    constructor({ options, gitInfo, hosting, markdownRenderer, htmlParsers, pageComponent, relative }) {
        this.options = options;
        this.gitInfo = gitInfo;
        this.hosting = hosting;
        this.renderer = markdownRenderer;
        this.parsers = htmlParsers;
        this.component = pageComponent;
        this.relative = relative;
    }

    async parse(file) {
        if (!(file.endsWith('.md') && !file.endsWith('.message.md')))
            return;

        const htmlFile = `${file.slice(0, -3)}.html`;
        console.info(chalk.green(`\t* creating ${path.relative(this.options.dst, htmlFile)}`));

        const html = await this.#render(file);

        await fs.writeFile(htmlFile, html);
    }

    async #render(file) {
        const markdown = `[[toc]]\n${await files.readFileAsString(file)}`;
        const response = getTitle(markdown, file);
        const element = await this.renderer.render(response.markdown);
        
        for (const parser of this.parsers) {
            await parser.parse(element, file);
        }

        const logout = getlogoutInfo(this.options, file);
        const showNav = getShowNavInfo(this.options, file);

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
            git: this.gitInfo
        });
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
        title = "home";

    if (title.indexOf(".") > -1)
        title = title.substring(0, title.indexOf("."))

    return title.charAt(0).toUpperCase() + title.slice(1)
        .replace("-", " ");
}