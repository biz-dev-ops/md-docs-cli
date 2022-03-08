const fs = require('fs').promises;
const { cwd } = require('process');
const path = require('path');
const chalk = require('chalk-next');
const files = require('../../utils/files');
const { sign } = require('crypto');

module.exports = class MarkdownFileParser {
    constructor({ options, menu, gitInfo, markdownRenderer, pageComponent }) {
        this.options = options;
        this.menu = menu;
        this.gitInfo = gitInfo;
        this.renderer = markdownRenderer;
        this.component = pageComponent;
    }

    async parse(file) {
        if (!file.endsWith('.md') && !path.basename(file).startsWith('_'))
            return;

        const htmlFile = `${file.slice(0, -3)}.html`;
        console.info(chalk.green(`\t* creating ${path.relative(this.options.dst, htmlFile)}`));

        const html = await this.#render(file);

        await fs.writeFile(htmlFile, html);

        console.info(chalk.green(`\t* deleting ${path.relative(this.options.dst, file)}`));
        await fs.unlink(file);
    }

    async #render(file) {
        let markdown = await files.readFileAsString(file);
        markdown = `[[toc]]\n${markdown}`;

        const response = getTitle(markdown, file);

        const html = await this.renderer.render(response.markdown);
        const menuItems = await this.menu.items();

        const signOut = getSignOutInfo(this.options, file);
        const showNav = getShowNavInfo(this.options, file);

        return this.component.render({
            showNav: showNav,
            signOut: signOut,
            root: getRelativeRoot(this.options),
            sourceFile: getSourceFile(this.options, file),
            url: getRelativeUrl(this.options, file),
            content: html,
            title: response.title,
            menu: menuItems,
            git: this.gitInfo,
        });
    }
}

function getShowNavInfo(options, file) {
    if (file.endsWith('401.md') || file.endsWith('403.md'))
        return false;
    
    return true;
}

function getSignOutInfo(options, file) {
    if (file.endsWith('401.md') || file.endsWith('403.md') || file.endsWith('404.md'))
        return null;

    if (!'hosting' in options ||
        !'routes' in options.hosting ||
        !'signOut' in options.hosting.routes) {
        return;
    }

    return options.hosting.routes.signOut;
}

function getRelativeRoot(options) {
    const root = path.relative(cwd(), options.dst);
    if (root === '')
        return root;

    return `${root}/`;
}

function getRelativeUrl(options, file) {
    return `${path.relative(options.dst, file).slice(0, -3)}.html`;
}

function getSourceFile(options, file) {
    const dstFile = path.relative(options.dst, file);
    const srcFile = path.resolve(options.src, dstFile);
    return path.relative(options.root, srcFile);
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