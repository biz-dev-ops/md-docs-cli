
const path = require("path");
const files = require("../files");
const { cwd } = require("process");

module.exports = class PageUtil {
    #orderPrefixRegex = /(\d+[_])/ig;
    #regexHeader = /(?<flag>#{1,6})\s+(?<content>.+)/gm;
    #aboutBlank = "about:blank";

    constructor({ options }) {
        this.options = options;
    }

    async getTitleFromMarkdown(markdownFile) {
        const markdown = await files.readFileAsString(markdownFile);
        const headings = this.getHeadingsFrom(markdown);
        const title = headings.find(item => item.heading === "h1")?.content;
        return title;
    }

    getTitleFromUrl(url) {
        if (this.options.dst === url) {
            return "Home";
        }

        let title = path.basename(url).split(".")[0];
        
        if(title === "index") {
            const dirname = path.dirname(url);
            if (this.options.dst === dirname) {
                title = "Home";
            }
            else {
                title = path.basename(dirname);
            }
        }
        
        return this.createTitle(title);
    }

    createTitle(title) {
        title = this.removeOrder(title);
        title = title.charAt(0).toUpperCase() + title.slice(1);
        return title.replaceAll("-", " ");
    }

    createAbsoluteUrl(url) {
        url = url.replace(this.#aboutBlank, "./index.html");

        if(!this.#isRelativeUrl(url))
            return null;

        url = path.resolve(cwd(), url);
        url = this.removeOrder(url);
        url = path.relative(this.options.dst, url);
        return url.replace(/\\/g, "/");
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
        return this.#relativeTo(cwd(), this.options.dst).replace(/\\/g, "/");
    }

    relativeRootFromBaseHref() {
        return this.#relativeTo(this.options.dst, this.options.basePath).replace(/\\/g, "/");
    }

    #relativeTo(from, to) {
        const root = path.relative(from, to).replace(/\\/g, "/");
        if (root === '')
            return root;
    
        return `${root}/`;
    }

    #isRelativeUrl(url) {
        return url.startsWith(".") || url.startsWith("#");
    }
}
