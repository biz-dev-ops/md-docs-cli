
const path = require("path");
const files = require("../files");
const { cwd } = require("process");

module.exports = class PageUtil {
    #orderPrefixRegex = /(\d+[_])/ig;
    #isRelativeUrlRegex = /^(?!www\.|(?:http|ftp)s?:\/\/|[A-Za-z]:\\|\/\/).*/gm;
    #regexHeader = /(?<flag>#{1,6})\s+(?<content>.+)/gm;
    #aboutBlank = "about:blank";

    constructor({ options }) {
        this.options = options;
    }

    async getTitleFromMarkdown(markdownFile) {
        const markdown = await files.readFileAsString(markdownFile);
        const headings = this.getHeadingsFrom(markdown);
        const title = headings.find(item => item.heading === "h1")?.content;
       
        if(title) {
            return title;
        }

        return this.getTitleFromUrl(markdownFile);
    }

    getTitleFromUrl(url) {
        if (this.options.dst === url) {
            return "Home";
        }

        let title = this.removeOrder(path.basename(url, ".md"));

        if(url.endsWith("index.md")) {
            const dirname = path.dirname(url);
            if (this.options.dst === dirname) {
                return "Home";
            }
            else {
                title = this.removeOrder(path.basename(dirname));
            }
        }
        
        return title
            .charAt(0).toUpperCase() + title.slice(1)
            .replaceAll("-", " ")
            .replace();
    }

    createAbsoluteUrl(url) {
        url = url.replace(this.#aboutBlank, "");

        if(!this.#isRelativeUrl(url))
            return null;

        url = path.resolve(cwd(), url);
        url = this.removeOrder(url);
        url = path.relative(this.options.dst, url);
        return url
    }

    removeOrder(url) {
        return url.replace(this.#orderPrefixRegex, '');
    }

    getHeadingsFrom(markdown) {
        return Array.from(markdown.matchAll(this.#regexHeader))
            .map(({ groups: { flag, content } }) => ({
                heading: `h${ flag.length }`,
                content
            }));
    }

    relativeBaseHref() {
        return this.#relativeTo(cwd(), this.options.dst);
    }

    relativeRootFromBaseHref() {
        this.#relativeTo(this.options.dst, this.options.basePath);
    }

    #relativeTo(from, to) {
        const root = path.relative(from, to);
        if (root === '')
            return root;
    
        return `${root}/`;
    }

    #isRelativeUrl(url) {
        return url.match(this.#isRelativeUrlRegex) !== null;
    }
}
