const fs = require("fs").promises;
const { execSync } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const MarkdownIt = require('markdown-it'), md = new MarkdownIt();

md.use(require("markdown-it-anchor"));
md.use(require("markdown-it-table-of-contents"));

const jsdom = require("jsdom");
const { JSDOM } = jsdom;


async function run() {
    await init(SRC_ROOT, DIST_ROOT);
    await copyFiles(SRC_ROOT, DIST_ROOT);
    await transformFiles(SRC_ROOT);
}

async function copyFiles(src, dst) {
    await fs.access(src);
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (let entry of entries) {
        const srcEntry = `${src}/${entry.name}`;
        const dstEntry = `${dst}/${entry.name}`;

        if (entry.isDirectory()) {
            await fs.mkdir(dstEntry);
            await copyFiles(srcEntry, dstEntry);
        } 
        else {
            await fs.copyFile(srcEntry, dstEntry);
        }
    }
}

async function transformFiles(dir, root = "") {
    await fs.access(dir);
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (let entry of entries) {
        const src = `${dir}/${entry.name}`;

        if (entry.isDirectory()) {
            await transformFiles(src, `${root}../`);
        } 
        else {
            await transformFile(src, root);
        }
    }
}

async function transformFile(file, root) {
    console.log(file)

    await transformMarkDown(file, root);
}

async function transformMarkDown(file, root) {
    if(!file.endsWith(".md"))
        return;    

    const dst = file.replace(/\.md$/, ".html");
    let html = await renderMarkdown(file, root);
    html = await parseHtml(html, dst, root);
    html = await addTemplate(html, root);
    
    await fs.writeFile(file, html);    
    await fs.rename(file, dst);
}

async function renderMarkdown(file) {
    const content = await readFileAsString(file);
    const markdown = MARKDOWN_TEMPLATE(content)
    let html = md.render(markdown);
    html = HTML_CONTENT_TEMPLATE(html);
    return html;
}

async function parseHtml(html, file, root) {
    const fragment = JSDOM.fragment(html);
    
    await parseAnchors(fragment, file, root);
    await removeEmptyParagraphs(fragment, file);
    
    return fragment.firstChild.outerHTML;
}

async function addTemplate(html) {
    return HTML_TEMPLATE(html);
}

async function parseAnchors(fragment, file, root) {
    const anchors = fragment.querySelectorAll("a");
    for (let anchor of anchors) {
        await parseBPMNAnchor(anchor, file, root);
        await parseTaskMarkdownAnchor(anchor, file, root);
        await parseOpenapiAnchor(anchor, file, root);
        await parseAsyncApiAnchor(anchor, file, root);
    }
}

async  function removeEmptyParagraphs(framents, file) {
    const paragraphs = framents.querySelectorAll("p");
    for (let p of paragraphs) {
        if(p.innerHTML === "") {            
            p.parentNode.removeChild(p);
            console.log(`Removed empty paragraph from ${file}`);
        }
    }
}

async function parseBPMNAnchor(anchor, file) {
    if(!anchor.href.endsWith(".bpmn"))
        return;

    const id = uuidv4();
    const xml = (await readFileAsString(relativeFileLocation(file, anchor.href)))
        .replace(/(\r\n|\n|\r)/gm, "")
        .replace("'", "\'");

    const parent = anchor.parentNode;
    const container = parent.parentNode;
    const fragment = JSDOM.fragment(BPMN_TEMPLATE(id, xml, anchor.href));
    container.insertBefore(fragment, parent);
    parent.removeChild(anchor);
    
    console.log(`Parsed bpmn anchor in ${file}`);
}

async function parseTaskMarkdownAnchor(anchor, file) {
    if(!anchor.href.endsWith(".task.md"))
        return;
    
    console.log(`Parsed task markdown anchor in ${file}`);
}

async function parseOpenapiAnchor(anchor, file, root) {
    if(!anchor.href.endsWith("openapi.yaml"))
        return;

    const src = getRelativePath(relativeFileLocation(file, anchor.href));    

    const parent = anchor.parentNode;
    const container = parent.parentNode;
    const fragment = JSDOM.fragment(OPENAPI_TEMPLATE(root, `${src}`));
    container.insertBefore(fragment, parent);
    parent.removeChild(anchor);

    console.log(`Parsed openapi anchor in ${file}`);    
}

async function parseAsyncApiAnchor(anchor, file) {
    if(!anchor.href.endsWith("asyncapi.yaml"))
        return;

    console.log(`Parsed asyncapi anchor in ${file}`);
}

async function init(src, dst) {
    await fs.rm(dst, { recursive: true, force: true });
    await fs.access(src);
    await fs.mkdir(dst);
    await copySwaggerUiFiles(`${ROOT}/node_modules/swagger-ui-dist`, `${dst}/assets/swagger-ui-dist`);    
}

async function copySwaggerUiFiles(src, dst) {
    await fs.access(src);
    await fs.mkdir(dst, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (let entry of entries) {
        const srcEntry = `${src}/${entry.name}`;
        const dstEntry = `${dst}/${entry.name}`;
        await fs.copyFile(srcEntry, dstEntry);
    }
}

function getPath(file) {
    return file.substring(0, file.lastIndexOf("/"));
}

function getRelativePath(path, root = DIST_ROOT) {
    return path.replace(root, "");
}

function relativeFileLocation(src, ref) {
    return `${getPath(src)}/${ref}`;
}

async function readFileAsString(file, encoding = "utf8") {
    const content = await fs.readFile(file);
    return content.toString(encoding);
}

const ROOT = require('path').resolve('./');
const SRC_ROOT = require('path').resolve('./docs');
const DIST_ROOT = require('path').resolve('./dist');
const MARKDOWN_TEMPLATE = (markdown) => `[[toc]]${markdown}`;
const HTML_CONTENT_TEMPLATE = (html) => `<div class="content">${html}</div>`;
const HTML_TEMPLATE = (content) => content;
const BPMN_TEMPLATE = (id, xml, href) => `<div id="${id}" class="bpmn"></div>
<script>
    const xml = '${xml}';
    const viewer = new BpmnJS({
        container: "#${id}"
    });

    try {
        const { warnings } = await viewer.importXML(xml);
        if(warnings) {
            console.log("Warnings while rendering bpmn file: ${href}", warnings);
        }
    } 
    catch (err) {
        console.log("Error rendering bpmn file: ${href}", err);
    }
</script>`;
const OPENAPI_TEMPLATE = (root, url) => `<iframe src="${root}assets/swagger-ui-dist/index.html?yaml=${url}" />`

run();

