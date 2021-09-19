#! /usr/bin/env node

const fs = require("fs").promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const markdown_it_anchor = require('markdown-it-anchor')
const md = require('markdown-it')({  html: true, linkify: true, typographer: true })
    .use(markdown_it_anchor, {  
        permalink: markdown_it_anchor.permalink.linkInsideHeader({
            symbol: "¶"            
        })
    })
    .use(require("markdown-it-multimd-table"))
    .use(require("markdown-it-container"), "info")
    .use(require("markdown-it-container"), "warning")
    .use(require("markdown-it-container"), "error")
    .use(require("markdown-it-toc-done-right"), {
        level: [1,2,3]
    })
    .use(require('markdown-it-plantuml-ex'));

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const SwaggerParser = require("@apidevtools/swagger-parser");
const Mustache = require('mustache');
const AsyncApiParser = require("@asyncapi/parser");


async function run() {
    await init(DOCS_ROOT, DIST_ROOT);
    await copyFiles(DOCS_ROOT, DIST_ROOT);
    const menu = await getMenu(DIST_ROOT)    
    await transformFiles(DIST_ROOT, menu);
    await copyFiles(`${MODULE_ROOT}/assets`, `${DIST_ROOT}/assets`);
    await copyFiles(`${MODULE_ROOT}/node_modules/swagger-ui-dist`, `${DIST_ROOT}/assets/swagger-ui-dist`);
    await copyFiles(`${MODULE_ROOT}/node_modules/bpmn-js/dist`, `${DIST_ROOT}/assets/bpmn-js-dist`);
    await copyFiles(`${MODULE_ROOT}/node_modules/@asyncapi/html-template/template`, `${DIST_ROOT}/assets/asyncapi/html-template`);
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

async function transformFiles(dir, menu, root = "") {
    await fs.access(dir);
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (let entry of entries) {
        const src = `${dir}/${entry.name}`;

        if (entry.isDirectory()) {
            await transformFiles(src, menu, `${root}../`);
        } 
        else {
            await transformFile(src, menu, root);
        }
    }
}

async function getMenu(src, parent = null, path = "") {
    const items = [];

    if(parent == undefined) {
        items.push({
            name: "home",
            url: `index.html`,
            has_url: true,
            has_items: false,
            items: false
        });
    }

    const entries = await fs.readdir(src, { withFileTypes: true });

    for (let entry of entries) {
        const dir = `${src}/${entry.name}`;
        if (entry.isDirectory()) {
            const subItems = await getMenu(dir,  entry.name, `${path}${entry.name}/`);
            const name = entry.name.replace("-", " ");

            try {
                await fs.access(`${dir}/index.md`);

                items.push({
                    name: name,
                    url: `${path}${entry.name}/index.html`,
                    has_url: true,
                    has_items: subItems.has_items,
                    items: subItems.items
                });
            }
            catch {
                if(subItems.has_items) {
                    items.push({
                        name: name,
                        has_url: false,
                        has_items: subItems.has_items,
                        items: subItems.items
                    });
                }
            }            
        } 
    }
    
    return {
        has_items: items.length > 0,
        items: items.length === 0 ? false : items
    };
}

function renderMenu(root, menu) {
    const template = MENU_TEMPLATE(root);
    return Mustache.render(template, menu, {
        "sub_menu": template
    });
}

async function transformFile(file, menu, root) {
    var html = await transformMarkDown(file, menu, root);
}

async function transformMarkDown(file, menu, root) {
    if(!file.endsWith(".md"))
        return;    

    const dst = file.replace(/\.md$/, ".html");
    const renderedHtml = await renderMarkdown(file, root);
    const fragment = await parseHtml(renderedHtml, dst, root);
    const title = createTitleFromPath(dst);
    const html = Mustache.render(HTML_TEMPLATE, { root, menu: renderMenu(root, menu), content: fragment.firstChild.outerHTML, title });
    
    await fs.writeFile(file, html);    
    await fs.rename(file, dst);

    console.log(`Transformed markdown file ${file}`);
}

function createTitleFromPath(file) {
    let title = null;
    if(file.endsWith("index.html")) {
        title = path.basename(path.dirname(file));
    }
    else {
        title = path.basename(file);
        title = title.substring(0, title.lastIndexOf("."));
    }

    title = title.replace("-", " ");
    return title;
}

async function renderMarkdown(file) {
    const content = await readFileAsString(file);
    const markdown = MARKDOWN_TEMPLATE(content)
    let html = md.render(markdown);
    html = Mustache.render(HTML_CONTENT_TEMPLATE, { html });
    return html;
}

async function parseHtml(html, file, root) {
    const fragment = JSDOM.fragment(html);
    
    await parseAnchors(fragment, file, root);
    await removeEmptyParagraphs(fragment, file);
    await addHeadingContainers(fragment)
    
    return fragment;
}

async function parseAnchors(fragment, file, root) {
    const anchors = fragment.querySelectorAll("a");
    for (let anchor of anchors) {
        await parseBPMNAnchor(anchor, file, root);
        await parseOpenapiAnchor(anchor, file, root);
        await parseAsyncApiAnchor(anchor, file, root);
        await parseFeatureAnchor(anchor, file, root);
        await parseMarkdownAnchor(anchor, file, root);
    }
}

async  function removeEmptyParagraphs(fragment, file) {
    const paragraphs = fragment.querySelectorAll("p");
    for (let p of paragraphs) {
        if(p.innerHTML === "") {            
            p.parentNode.removeChild(p);
            console.log(`Removed empty paragraph from ${file}`);
        }
    }
}

async function addHeadingContainers(fragment) {
    const el = fragment.firstChild.firstChild;
    const container = JSDOM.fragment("<div></div>").firstChild;    
    addToHeadingContainer(el, container, 0);
    el.parentNode.appendChild(container);
}

function addToHeadingContainer(el, container, level) {
    while (el) {
        let next = el.nextSibling;        
        if(el.localName && el.localName.match(/^h\d{1,}$/)) {            
            const newLevel = Number.parseInt(el.localName.substring((1)));
            
            if(newLevel > level) {
                const headerContainer = JSDOM.fragment(HEADER_CONTAINER_TEMPLATE(el.localName)).firstChild;
                container.appendChild(headerContainer);
                headerContainer.getElementsByClassName("header")[0].appendChild(el);
                next = addToHeadingContainer(next, headerContainer.getElementsByClassName("container")[0], newLevel);
            }
            else {
                return el;
            }
        }
        else {
            if(level === 0 && el.localName && el.localName === "nav") {
                //skip level 0 nav element
            }
            else {
                container.appendChild(el);
            }
        }
        el = next;
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
    const fragment = JSDOM.fragment(Mustache.render(BPMN_TEMPLATE, { id, xml, href: anchor.href }));
    container.insertBefore(fragment, parent);
    parent.removeChild(anchor);
    
    console.log(`Parsed bpmn anchor in ${file}`);
}

async function parseOpenapiAnchor(anchor, file, root) {
    if(!anchor.href.endsWith("openapi.yaml"))
        return;

    const src =  `${anchor.href.substring(0, anchor.href.length - 5)}.html`;
    const dst = relativeFileLocation(file, src);

    const parent = anchor.parentNode;
    const container = parent.parentNode;
    const fragment = JSDOM.fragment(Mustache.render(OPENAPI_IFRAME_TEMPLATE, { src: src }));
    container.insertBefore(fragment, parent);
    parent.removeChild(anchor);
    
    const json = await SwaggerParser.validate(relativeFileLocation(file, anchor.href));
    const html = Mustache.render(OPENAPI_TEMPLATE, { root, json: JSON.stringify(json) });
    fs.writeFile(dst, html);

    console.log(`Parsed openapi anchor in ${file}`);    
}

async function parseAsyncApiAnchor(anchor, file, root) {
    if(!anchor.href.endsWith("asyncapi.yaml"))
        return;
    
    const src =  `${anchor.href.substring(0, anchor.href.length - 5)}.html`;
    const dst = relativeFileLocation(file, src);

    const parent = anchor.parentNode;
    const container = parent.parentNode;
    const fragment = JSDOM.fragment(Mustache.render(ASYNCAPI_IFRAME_TEMPLATE, { src: src }));
    container.insertBefore(fragment, parent);
    parent.removeChild(anchor);
    
    const yaml = await readFileAsString(relativeFileLocation(file, anchor.href));
    const json = await AsyncApiParser.parse(yaml);
    const html = Mustache.render(ASYNCAPI_TEMPLATE, { title: `${json["_json"].info.title} ${json["_json"].info.version}`, root, json: JSON.stringify(json["_json"]) });
    fs.writeFile(dst, html);

    console.log(`Parsed asyncapi anchor in ${file}`);
}

async function parseFeatureAnchor(anchor, file) {
    if(!anchor.href.endsWith(".feature"))
        return;

    const feature = (await readFileAsString(relativeFileLocation(file, anchor.href)));

    const parent = anchor.parentNode;
    const container = parent.parentNode;
    const fragment = JSDOM.fragment(Mustache.render(FEATURE_TEMPLATE, { feature } ));
    container.insertBefore(fragment, parent);
    parent.removeChild(anchor);
    
    console.log(`Parsed feature anchor in ${file}`);
}

async function parseMarkdownAnchor(anchor, file) {
    if(!anchor.href.endsWith(".md") && !anchor.href.includes(".md#"))
        return;

    if(anchor.href.endsWith(".md"))
        anchor.href = `${anchor.href.substring(0, anchor.href.length - 3)}.html`;
    else
        anchor.href = anchor.href.replace(".md#", ".html#");

    console.log(`Parsed markdown anchor in ${file}`);
}

async function init(src, dst) {
    await fs.rm(dst, { recursive: true, force: true });
    await fs.access(src);
    await fs.mkdir(dst);    
}

function getPath(file) {
    return file.substring(0, file.lastIndexOf("/"));
}

function relativeFileLocation(src, ref) {
    return `${getPath(src)}/${ref}`;
}

async function readFileAsString(file, encoding = "utf8") {
    const content = await fs.readFile(file);
    return content.toString(encoding);
}

const MODULE_ROOT = `${__dirname}/..`
const ROOT = path.resolve('./');
const DOCS_ROOT = `${ROOT}/docs`;
const DIST_ROOT = `${ROOT}/dist`;

const MARKDOWN_TEMPLATE = (markdown) => `[[toc]]
${markdown}`;

const HTML_CONTENT_TEMPLATE = `<article>{{{html}}}</article>`;

const HEADER_CONTAINER_TEMPLATE = (h) => `<div class="header-container ${h}">
    <div class="header"></div>
    <div class="container"></div>
</div>`;

const MENU_TEMPLATE = (root) => `
{{#has_items}}
<ul>
{{#items}}
    <li>
        {{#has_url}}
        <a href="${root}{{{url}}}">{{name}}</a>
        {{/has_url}}
        {{^has_url}}
        <span>{{name}}</span>
        {{/has_url}}
        {{#has_items}}
        {{>sub_menu}}
        {{/has_items}}
    </li>
{{/items}}
</ul>
{{/has_items}}`;

const HTML_TEMPLATE = `<!DOCTYPE HTML>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<title>{{title}}</title>    
    <link rel="stylesheet" type="text/css" href="{{{root}}}assets/style.css" />
    <link rel="icon" type="image/png" href="{{{root}}}assets/favicon-32x32.png" sizes="32x32" />
    <link rel="icon" type="image/png" href="{{{root}}}assets/favicon-16x16.png" sizes="16x16" />
    <script src="{{{root}}}assets/bpmn-js-dist/bpmn-viewer.production.min.js"></script>
</head>
<body>
    <header>
        <span class="title">{{title}}</title>
        <nav>
            {{{menu}}}
        </nav>
    </header>    
    {{{content}}}
    <footer>

    </footer>
    <script src="{{{root}}}assets/script.js" charset="UTF-8"> </script>
</body>
</html>`;

const BPMN_TEMPLATE = `<div id="{{id}}" class="bpmn"></div>
<script>
    const xml = '{{{xml}}}';
    const viewer = new BpmnJS({
        container: "#{{id}}"
    });

    viewer.importXML(xml)
        .then(response => {
            if(response.warnings.length > 0) {
                console.log("Warnings while rendering bpmn file: {{href}}", response.warnings);
            }            
        })
        .catch(error => {
            console.log("Error rendering bpmn file: {{href}}", error);
        });
</script>`;

const FEATURE_TEMPLATE = `<pre><code class="feature">{{feature}}</code></pre>`;

const OPENAPI_IFRAME_TEMPLATE = `<iframe class="openapi" src="{{src}}" />`;

const ASYNCAPI_IFRAME_TEMPLATE = `<iframe class="asyncapi" src="{{src}}" />`;

const OPENAPI_TEMPLATE = `<!-- HTML for static distribution bundle build -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Swagger UI</title>
    <link rel="stylesheet" type="text/css" href="{{{root}}}assets/swagger-ui-dist/swagger-ui.css" />
    <link rel="icon" type="image/png" href="{{{root}}}assets/swagger-ui-dist/favicon-32x32.png" sizes="32x32" />
    <link rel="icon" type="image/png" href="{{{root}}}assets/swagger-ui-dist/favicon-16x16.png" sizes="16x16" />
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
    <div id="root"></div>

    <script src="{{{root}}}assets/swagger-ui-dist/swagger-ui-bundle.js" charset="UTF-8"> </script>
    <script src="{{{root}}}assets/swagger-ui-dist/swagger-ui-standalone-preset.js" charset="UTF-8"> </script>
    <script>
    window.onload = function() {
      // Begin Swagger UI call region
      const ui = SwaggerUIBundle({
        spec: {{{json}}},
        dom_id: '#root',
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

const ASYNCAPI_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">  
    <title>{{title}}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">  
    <link href="{{{root}}}assets/asyncapi/html-template/css/styles.min.css" rel="stylesheet">  
  </head>

  <body>
    <div id="root"></div>  
    <script src="{{{root}}}assets/asyncapi/html-template/js/asyncapi-ui.min.js" type="application/javascript"></script> 
    <script>
      var schema = {{{json}}};
      var config = {
          "show": {
              "sidebar":true
          },
          "sidebar": { 
            "showOperations": "byDefault"
          }
      };
      AsyncApiStandalone.hydrate({ schema, config }, document.getElementById("root"));
    </script>
  </body>
</html>`;

run();
