const fs = require('fs').promises;
const { env, cwd } = require('process');
const path = require('path');
const colors = require('colors');
const files = require('../../utils/files');
const orderPrefixRegex = /(\d+[_])/ig;

module.exports = class MarkdownFileParser {
    constructor({ options, gitInfo, hosting, markdownRenderer, pageComponent, menu, relative, locale, htmlParsers }) {
        this.options = options;
        this.gitInfo = gitInfo;
        this.hosting = hosting;
        this.renderer = markdownRenderer;
        this.component = pageComponent;
        this.menu = menu;
        this.relative = relative;
        this.locale = locale;
        this.parsers = htmlParsers;
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
        const markdown = await files.readFileAsString(file);
        const response = this.#getTitle(markdown, file);
        const element = await this.renderer.render(response.markdown);

        if (env.NODE_ENV === 'development')
            await fs.writeFile(`${file}.html`, element.outerHTML);

        for (const parser of this.parsers) {
            await parser.parse(element, file);
        }

        this.#relativeUrlToAbsoluteUrl(element);

        if (env.NODE_ENV === 'development')
            await fs.writeFile(`${file}.parsed.html`, element.outerHTML);
        
        element.innerHTML = element.innerHTML.replace(orderPrefixRegex, '');

        const logout = this.#getlogoutInfo(this.options, file);
        const showNav = this.#getShowNavInfo(this.options, file);
        const menuItems = await this.menu.items(`${path.relative(this.options.dst, file).slice(0, -3)}.html`);

        const url = this.#getRelativeUrl(this.options, file);
        const relative = this.relative.get();
        if (this.hosting.rewrite(url)) {
            relative.root = `/${this.gitInfo.branch.path}`;
        }

        return this.component.render({
            relative: relative,
            showNav: showNav,
            logout: logout,
            sourceFile: this.#getSourceFile(this.options, file),
            url: url,
            content: element.innerHTML,
            title: response.title,        
            git: this.gitInfo,
            options: this.options.page || {},
            menu: menuItems,
            locale: await this.locale.get()
        });
    }

    #absoluteLocation() {
        const loc = path.relative(this.options.dst, cwd());
        if(loc.length === 0)
            return loc;

        return loc + '/';``
    }

    #relativeUrlToAbsoluteUrl(element) {
        const aboutBlank = "about:blank";
         const absoluteLocation = this.#absoluteLocation();

        const isRelativeUrl = function(url) {
            if(!url)
                return false;
            
            if(url.startsWith("."))
                return true;

            if(url.startsWith(aboutBlank))
                return true;

            if(url.startsWith("#"))
                return true;

            return false;
        }


        Array.from(element.querySelectorAll("[href],[src]")).forEach(el => {
            if(!isRelativeUrl(el.href || el.src)) {
                return;
            }

            const url =  absoluteLocation + (el.href || el.src).replace(aboutBlank, "");

            if(el.href) {
                el.href = url;
            }
            else if(el.src) {
                el.src = url;
            }
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

    #getRelativeUrl(options, file) {
        return `${path.relative(options.dst, file).slice(0, -3)}.html`;
    }

    #getSourceFile(options, file) {
        const dstFile = path.relative(options.dst, file);
        const srcFile = path.resolve(options.src, dstFile);
        return path.relative(options.src, srcFile);
    }

    #getTitle(markdown, file) {
        const response = this.#getTitleFromMarkdown(markdown);
        if (response != undefined)
            return response;

        const title = this.#getTitleFromFile(file);
        return {
            title: this.#formatTitle(title),
            markdown
        };
    }

    #getTitleFromMarkdown(markdown) {
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

    #getTitleFromFile(file) {
        if (file.endsWith('index.md')) {
            return path.basename(path.dirname(file));
        }
        else {
            return path.basename(file);
        }
    }

    #formatTitle(title) {
        if (title === "dist")
            title = "Home";

        if (title.indexOf(".") > -1)
            title = title.substring(0, title.indexOf("."))

        return title.charAt(0).toUpperCase() + title.slice(1)
            .replace("-", " ");
    }
}
