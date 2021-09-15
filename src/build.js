const fs = require("fs").promises;
const { v4: uuidv4 } = require('uuid');
const MarkdownIt = require('markdown-it'), md = new MarkdownIt();

md.use(require("markdown-it-anchor"));
md.use(require("markdown-it-table-of-contents"));

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const SwaggerParser = require("@apidevtools/swagger-parser");

async function run() {
    await init(SRC_ROOT, DIST_ROOT);
    await copyFiles(SRC_ROOT, DIST_ROOT);
    await transformFiles(DIST_ROOT);
    await copyFiles(`${ROOT}/node_modules/swagger-ui-dist`, `${DIST_ROOT}/assets/swagger-ui-dist`);
    await copyFiles(`${ROOT}/node_modules/bpmn-js/dist`, `${DIST_ROOT}/assets/bpmn-js-dist`);
}

async function copyFiles(src, dst) {
    await fs.mkdir(dst, { recursive: true });
    await fs.access(src);
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (let entry of entries) {
        const srcEntry = `${src}/${entry.name}`;
        const dstEntry = `${dst}/${entry.name}`;

        if (entry.isDirectory()) {
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
    await transformMarkDown(file, root);
}

async function transformMarkDown(file, root) {
    if(!file.endsWith(".md"))
        return;    

    const dst = file.replace(/\.md$/, ".html");
    let html = await renderMarkdown(file, root);
    html = await parseHtml(html, dst, root);
    html = HTML_TEMPLATE(root, html, "TODO");
    
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

    const id = `bpmn-container-${uuidv4()}`;
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

    const parent = anchor.parentNode;
    const container = parent.parentNode;
    const fragment = JSDOM.fragment(OPENAPI_TEMPLATE());
    container.insertBefore(fragment, parent);
    parent.removeChild(anchor);

    const id = `openapi-container-${uuidv4()}`;
    const dst = relativeFileLocation(file, `${anchor.href.substring(0, anchor.href.length - 5)}.html`);
    const json = await SwaggerParser.validate(relativeFileLocation(file, anchor.href));
    fs.writeFile(dst, SWAGGER_UI_TEMPLATE(id, root, JSON.stringify(json)));

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
}

function getPath(file) {
    return file.substring(0, file.lastIndexOf("/"));
}

function getRelativePath(path, root = DIST_ROOT) {
    return path.replace(root, "").substr(1);
}

function relativeFileLocation(src, ref) {
    return `${getPath(src)}/${ref}`;
}

async function readFileAsString(file, encoding = "utf8") {
    const content = await fs.readFile(file);
    return content.toString(encoding);
}

const ROOT = require('path').resolve('./');
const SRC_ROOT = require('path').resolve('./docs/');
const DIST_ROOT = require('path').resolve('./dist/');
const MARKDOWN_TEMPLATE = (markdown) => `[[toc]]\n${markdown}`;
const HTML_CONTENT_TEMPLATE = (html) => `<div id="canvas">${html}</div>`;
const HTML_TEMPLATE = (root, content, title) => `<!DOCTYPE HTML>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<title>${title}</title>
    <script src="${root}assets/bpmn-js-dist/bpmn-viewer.production.min.js"></script>
    <style>
        html, body, #canvas {
            height: 100%;
            padding: 0;
            margin: 0;
        }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
const BPMN_TEMPLATE = (id, xml, href) => `<div id="${id}" class="bpmn"></div>
<script>
    const xml = '${xml}';
    const viewer = new BpmnJS({
        container: "#${id}"
    });

    viewer.importXML(xml)
        .then(response => {
            if(response.warnings.length > 0) {
                console.log("Warnings while rendering bpmn file: ${href}", response.warnings);
            }            
        })
        .catch(error => {
            console.log("Error rendering bpmn file: ${href}", error);
        });
</script>`;
const OPENAPI_TEMPLATE = () => `<iframe class="openapi" src="openapi.html" />`
const SWAGGER_UI_TEMPLATE = (id, root, json) => `<!-- HTML for static distribution bundle build -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Swagger UI</title>
    <link rel="stylesheet" type="text/css" href="${root}assets/swagger-ui-dist/swagger-ui.css" />
    <link rel="icon" type="image/png" href="${root}assets/swagger-ui-dist/favicon-32x32.png" sizes="32x32" />
    <link rel="icon" type="image/png" href="${root}assets/swagger-ui-dist/favicon-16x16.png" sizes="16x16" />
    <style>
      html
      {
        box-sizing: border-box;
        overflow: -moz-scrollbars-vertical;
        overflow-y: scroll;
      }

      *,
      *:before,
      *:after
      {
        box-sizing: inherit;
      }

      body
      {
        margin:0;
        background: #fafafa;
      }
    </style>
  </head>

  <body>
    <div id="${id}"></div>

    <script src="${root}assets/swagger-ui-dist/swagger-ui-bundle.js" charset="UTF-8"> </script>
    <script src="${root}assets/swagger-ui-dist/swagger-ui-standalone-preset.js" charset="UTF-8"> </script>
    <script>
    window.onload = function() {
      // Begin Swagger UI call region
      const ui = SwaggerUIBundle({
        spec: ${json},
        dom_id: '#${id}',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ]
      });
      // End Swagger UI call region

      window.ui = ui;
    };
  </script>
  </body>
</html>`;

run();

