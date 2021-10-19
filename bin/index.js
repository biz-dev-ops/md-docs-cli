#! /usr/bin/env node

const fs = require("fs").promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const markdown_it_anchor = require('markdown-it-anchor');
const md = require('markdown-it')
    ({  html: true, linkify: true, typographer: true })
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
    .use(require("markdown-it-plantuml-ex"))
    .use(require("markdown-it-abbr"))
    .use(require("markdown-it-codetabs"))
    .use(require("markdown-it-attrs"));

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const SwaggerParser = require("@apidevtools/swagger-parser");``
const Mustache = require('mustache');
const AsyncApiParser = require("@asyncapi/parser");
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { Octokit } = require("octokit");
const yargs = require("yargs");
const RefParser = require("@apidevtools/json-schema-ref-parser");
const options = yargs
 .usage("Usage: -b")
 .option("b", { alias: "branches", describe: "Output banches only", type: "boolean", demandOption: false })
 .argv;


async function run() {
    const menu_data = await getMenu(DOCS_ROOT);
    const git = await getGitInfo();
    const DIST_BRANCH_ROOT = path.resolve(`./dist${git.path}`);

    await init(DOCS_ROOT, DIST_BRANCH_ROOT);
    await createGitBranchFile(DIST_ROOT, git.branches);

    if(options.branches) {
        return;
    }

    await copyFiles(DOCS_ROOT, DIST_BRANCH_ROOT);    
    await transformFiles(DIST_BRANCH_ROOT, menu_data, git, DIST_BRANCH_ROOT);
    await copyFiles(`${MODULE_ROOT}/assets`, `${DIST_BRANCH_ROOT}/assets`);
    await copyFiles(`${MODULE_ROOT}/node_modules/swagger-ui-dist`, `${DIST_BRANCH_ROOT}/assets/swagger-ui-dist`);
    await copyFiles(`${MODULE_ROOT}/node_modules/bpmn-js/dist`, `${DIST_BRANCH_ROOT}/assets/bpmn-js-dist`);
    await copyFiles(`${MODULE_ROOT}/node_modules/@asyncapi/html-template/template`, `${DIST_BRANCH_ROOT}/assets/asyncapi/html-template`);
    await copyFiles(`${MODULE_ROOT}/node_modules/jsonform/deps`, `${DIST_BRANCH_ROOT}/assets/jsonform/deps`);
    await copyFiles(`${MODULE_ROOT}/node_modules/jsonform/lib`, `${DIST_BRANCH_ROOT}/assets/jsonform/lib`);
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

async function transformFiles(dir, menu_data, git, root) {
    await fs.access(dir);
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (let entry of entries) {
        const src = `${dir}/${entry.name}`;

        if (entry.isDirectory()) {
            await transformFiles(src, menu_data, git, root);
        } 
        else {
            await transformFile(src, menu_data, git, root);
        }
    }
}

async function transformFile(file, menu_data, git, root) {
    await transformMarkDown(file, menu_data, git, root);
}

async function transformMarkDown(file, menu_data, git, root) {
    if(!file.endsWith(".md"))
        return;    

    const response = await renderMarkdown(file);
    
    const dst = file.replace(/\.md$/, ".html");
    const relativeRoot = getRelativeRootFromFile(dst, root);

    await parseHtml(response.template, dst, root);
   
    const data = { 
        git,
        git_string: JSON.stringify(git), 
        root: relativeRoot,
        menu: renderMenu(relativeRoot, menu_data),
        content: response.template.innerHTML, 
        title: response.title,
        source_file: `/docs${file.replace(root, "")}`
    };

    const html = Mustache.render(HTML_TEMPLATE, data);
    
    await fs.writeFile(file, html);    
    await fs.rename(file, dst);

    console.log(`Transformed markdown file ${file}`);
}

async function renderMarkdown(file) {
    const content = await readFileAsString(file);
    const response = getTitle(file, content);
    let html = md.render(`[[toc]]\n${response.markdown}`);
    html = Mustache.render(HTML_CONTENT_TEMPLATE, { html });

    const template = JSDOM.fragment("<div></div>").firstElementChild;
    template.innerHTML = html;

    return { template, title: response.title };
}

async function parseHtml(template, file, root) {
    await addHeadingContainers(template);
    await parseUnsortedLists(template, file);
    await parseImages(template, file);
    await parseAnchors(template, file, root);
    await parseUnsortedLists(template, file);
    await cleanUp(template);
    await removeEmptyParagraphs(template, file);
    
    
    return template;
}

async function parseImages(template, file) {
    const images = template.querySelectorAll("img");
    for (let img of images) {
        const fragment = JSDOM.fragment(Mustache.render(FIGURE_TEMPLATE, { img: img.outerHTML, align: getUrlParameter(img.src, "align") }));
        replaceWithFragment(fragment, img);

        console.log(`Wrapped image with figure in ${file}`);
    }
}

async function parseUnsortedLists(template, file) {
    const uls = template.querySelectorAll("ul");
    for (let ul of uls) {
        await ParseFileTabsUl(ul, file);
    }
}

async function ParseFileTabsUl(ul, file) {
    if (!ul.querySelector("a.replaced"))
        return;
    
    const parent_id = createUniqueId(ul);
    
    const collection = Array.from(ul.querySelectorAll("a"))
        .map(a => ({
            id: `${parent_id}-${makeUrlFriendly(a.text)}`,
            href: a.href,
            text: a.text,
            el: a.previousSibling.outerHTML
        }));
    
    const fragment = JSDOM.fragment(Mustache.render(TABS_TEMPLATE, { items: collection }));
    replaceWithFragment(fragment, ul);
    
    console.log(`Parsed file-tabs ul in ${file}`);
}

async function parseAnchors(template, file, root) {
    const anchors = template.querySelectorAll("a");
    for (let anchor of anchors) {
        await parseBPMNAnchor(anchor, file, root);
        await parseOpenapiAnchor(anchor, file, root);
        await parseAsyncApiAnchor(anchor, file, root);
        await parseJsonFormAnchor(anchor, file, root);
        await parseFeatureAnchor(anchor, file, root);
        await parseMarkdownAnchor(anchor, file, root);
    }
}

async  function removeEmptyParagraphs(template, file) {
    const paragraphs = template.querySelectorAll("p");
    for (let p of paragraphs) {
        if(p.innerHTML === "") {            
            p.parentNode.removeChild(p);
            console.log(`Removed empty paragraph from ${file}`);
        }
    }
}

async function addHeadingContainers(template) {
    const main = template.querySelector("main");
    const container = JSDOM.fragment("<article></article>").firstElementChild;
    addToHeadingContainer(main.firstChild, container, -1);
    if(container.childNodes.length > 0) {
        main.appendChild(container);
    }
}

function addToHeadingContainer(el, container, level) {
    while (el) {
        let next = el.nextSibling;        
        if(el.localName && el.localName.match(/^h\d{1,}$/)) {            
            const newLevel = Number.parseInt(el.localName.substring((1)));
            
            if(newLevel > level) {
                const headerContainer = JSDOM.fragment(HEADER_CONTAINER_TEMPLATE(el.localName)).firstElementChild;
                container.appendChild(headerContainer);
                headerContainer.getElementsByClassName("header")[0].appendChild(el);
                next = addToHeadingContainer(next, headerContainer.getElementsByClassName("container")[0], newLevel);
            }
            else {
                return el;
            }
        }
        else {
            if(level === -1) {
                if(el.localName && el.localName === "nav") {
                    if(el.querySelectorAll("a").length === 0) {
                        el.parentNode.removeChild(el);
                    }
                    else {
                        const parentNode = el.parentNode;
                        const tocContainer =  JSDOM.fragment(TOC_CONTAINER_TEMPLATE);
                        parentNode.insertBefore(tocContainer, el);
                        parentNode.querySelector("#toc-container").appendChild(el);
                    }
                }
                else {
                    const headlessContainer = JSDOM.fragment(HEADLESS_CONTAINER_TEMPLATE).firstElementChild;
                    container.appendChild(headlessContainer);
                    next = addToHeadingContainer(el, headlessContainer, 999999);
                }
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
    
    const fragment = JSDOM.fragment(Mustache.render(BPMN_TEMPLATE, { id, xml, href: anchor.href }));
    replaceWithFragment(fragment, anchor);
    
    console.log(`Parsed bpmn anchor in ${file}`);
}

async function parseOpenapiAnchor(anchor, file, root) {
    if(!anchor.href.endsWith("openapi.yaml"))
        return;

    const src =  `${anchor.href.substring(0, anchor.href.length - 5)}.html`;
    const dst = relativeFileLocation(file, src);
    const relativeRoot = getRelativeRootFromFile(dst, root);

    const fragment = JSDOM.fragment(Mustache.render(OPENAPI_IFRAME_TEMPLATE, { src }));
    replaceWithFragment(fragment, anchor);
    
    const json = await RefParser.dereference(relativeFileLocation(file, anchor.href));
    const html = Mustache.render(OPENAPI_TEMPLATE, { root: relativeRoot, json_string: JSON.stringify(json) });
    fs.writeFile(dst, html);

    try
    {
        await SwaggerParser.validate(json);
    }
    catch(ex)
    {
        console.error(JSON.stringify(ex));
    }

    console.log(`Parsed openapi anchor in ${file}`);
}

async function parseAsyncApiAnchor(anchor, file, root) {
    if(!anchor.href.endsWith("asyncapi.yaml"))
        return;
    
    const src =  `${anchor.href.substring(0, anchor.href.length - 5)}.html`;
    const dst = relativeFileLocation(file, src);
    const relativeRoot = getRelativeRootFromFile(dst, root);

    const fragment = JSDOM.fragment(Mustache.render(ASYNCAPI_IFRAME_TEMPLATE, { src: src }));
    replaceWithFragment(fragment, anchor);
    
    let json = await RefParser.dereference(relativeFileLocation(file, anchor.href));    
    
    try
    {
        // Does not work without parsed json.
        json = (await AsyncApiParser.parse(json))["_json"];
    }
    catch(ex)
    {
        console.error(JSON.stringify(ex))
    }
    
    const html = Mustache.render(ASYNCAPI_TEMPLATE, { title: `${json.info.title} ${json.info.version}`, root: relativeRoot, json: JSON.stringify(json) });
    fs.writeFile(dst, html);

    console.log(`Parsed asyncapi anchor in ${file}`);
}

async function parseJsonFormAnchor(anchor, file, root) {
    if(!anchor.href.endsWith("form.yaml"))
        return;

    const src =  `${anchor.href.substring(0, anchor.href.length - 5)}.html`;
    const dst = relativeFileLocation(file, src);
    const relativeRoot = getRelativeRootFromFile(dst, root);

    const fragment = JSDOM.fragment(Mustache.render(JSON_FORM_IFRAME_TEMPLATE, { src: src }));
    replaceWithFragment(fragment, anchor);
    
    const json = await RefParser.dereference(relativeFileLocation(file, anchor.href))
    const html = Mustache.render(JSON_FORM_TEMPLATE, { title: `${anchor.text}`, root: relativeRoot, json: JSON.stringify(json) });
    fs.writeFile(dst, html);

    console.log(`Parsed jsonform anchor in ${file}`);
}

async function parseFeatureAnchor(anchor, file) {
    if(!anchor.href.endsWith(".feature"))
        return;

    const feature = (await readFileAsString(relativeFileLocation(file, anchor.href)));
    const fragment = JSDOM.fragment(Mustache.render(FEATURE_TEMPLATE, { feature }));
    
    replaceWithFragment(fragment, anchor);
    
    console.log(`Parsed feature anchor in ${file}`);
}

function replaceWithFragment(fragment, el) {
    let ref = el;
    let parent = ref.parentNode;

    if (parent.nodeName === "P") {
        ref = parent;
        parent = ref.parentNode;
    }

    parent.insertBefore(fragment, ref);
    el.classList.add("replaced");
}

async function parseMarkdownAnchor(anchor, file) {
    if(!anchor.href.endsWith(".md") && !anchor.href.includes(".md#"))
        return;

    if(anchor.href.endsWith(".md")) {
        anchor.href = `${anchor.href.substring(0, anchor.href.length - 3)}.html`;
    }
    else {
        anchor.href = anchor.href.replace(".md#", ".html#");
    }

    console.log(`Parsed markdown anchor in ${file}`);
}

async function cleanUp(template) {
    const replaced = template.querySelectorAll(".replaced");
    for (let el of replaced) {
        el.parentNode.removeChild(el);
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
            const name = formatTitle(entry.name.replace("-", " "));

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

function renderMenu(root, menu_data) {
    const template = MENU_TEMPLATE(root);
    return Mustache.render(template, menu_data, {
        "sub_menu": template
    });
}

function createUniqueId(obj) {
    return getLeadingHeadings(obj)
        .reverse()
        .map(e => e.id ?? makeUrlFriendly(e.text))
        .join("-");
}

function getLeadingHeadings(o) {
    const headings = [];
    if (o == undefined)
        return headings;   
            
    let container = o;
    while (container = container.parentNode.closest(".header-container"))
    {
        headings.push(container.querySelector("h1,h2,h3"));
    }
    
    return headings;        
}

function makeUrlFriendly(value) {
    if (value == undefined)
        return null;
    
    return encodeURIComponent(value.toLowerCase().replace(/[^a-z0-9_-]+/gi, '-'));
}

function getPath(file) {
    return file.substring(0, file.lastIndexOf("/"));
}

function relativeFileLocation(src, ref) {
    return `${getPath(src)}/${ref}`;
}

function getRelativeRootFromFile(file, root) {
    const relativeRoot = path.relative(path.parse(file).dir, root);
    
    if(relativeRoot.endsWith(".."))
        return relativeRoot + "/";
    else
        return relativeRoot;
}

async function readFileAsString(file, encoding = "utf8") {
    const content = await fs.readFile(file);
    return content.toString(encoding);
}

async function getGitInfo() {

    const branch = await __exec(`git rev-parse --abbrev-ref HEAD`);
    const remote = await __exec(`git remote`);
    const origin = await __exec(`git config --get remote.origin.url`);
    const repository = getGitRepository(origin);
    const main_branch = (await __exec(`git remote show ${remote}`))
        .split(`\n`)
        .filter(l => l.includes("HEAD branch"))
        .map(l => l.substr(l.indexOf(":") + 1).trim())
        [0];

    const path = branch != main_branch ? "/" + featureBranchToPath(branch) : "";

    const remote_branches = (await new Octokit().request(`GET /repos/${repository}/branches`))
        .data.map(b => b.name);

    const local_branches = (await __exec(`git branch -a`))
        .split(`\n`)
        .map(b => b.replace("*", "").trim())
        .filter(b => !b.startsWith("remotes"));

    const branches = remote_branches.concat(local_branches.filter(b => !remote_branches.includes(b)))
        .map(b => ({
            name: b,
            path: b == main_branch ? "" : featureBranchToPath(b),
            is_feature_branch: b != main_branch
        }))
        .sort((a, b) => `${a.is_feature_branch ? "z" : "a"}${a.name}`.localeCompare(`${b.is_feature_branch ? "z" : "a"}${b.name}`));

    return { 
        branch,
        main_branch, 
        is_feature_branch: branch != main_branch, 
        repository,
        path,
        branches
    };
}

function getGitRepository(origin) {
    const parts = origin.trim().split("/");
    let repository = `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
    if(repository.endsWith(".git"))
        repository = repository.substring(0, repository.length - 4);

    const index = repository.indexOf(":");
    if(index > -1)
        repository = repository.substr(index + 1);

    return repository;
}

function featureBranchToPath(branch) {
    return branch
        .replace(" ", "-")
        .toLowerCase();
}

function getTitle(file, markdown) {
    let response = getTitleFromMarkdown(markdown);
    if(response.title != undefined)
        return response;

    response.title = getTitleFromFileName(file);
    return response;
}

function getTitleFromMarkdown(markdown) {
    let response = { title: null, markdown: null };
    if(markdown == undefined)
        return response;

    const lines = markdown.split("\n");    
    if(lines.length == 0) {
        lines.push(markdown);
    }    
    
    if(!lines[0].startsWith("# ")) {
        response.markdown = markdown;
        return response;
    }
    
    response.title = lines.shift().substring(2).trim();    
    response.markdown = lines.join("\n").trim();
    return response;
}

function getTitleFromFileName(file) {
    if(file.endsWith("index.md")) {
        return formatTitle(path.basename(path.dirname(file)));
    }
    else {    
        return formatTitle(path.basename(file));
    }
}

function formatTitle(title) {
    if(title === "dist")
        title = "home";

    if(title.indexOf(".") > -1)
        title = title.substring(0, title.indexOf("."))

    return title.charAt(0).toUpperCase() + title.slice(1)
        .replace("-", " ");
}

async function createGitBranchFile(dst, branches) {
    await fs.writeFile(`${dst}/branches.json`, JSON.stringify(branches));

    console.log(`Created branches.json in ${dst}`);
}

function getUrlParameter(url, name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    try {
        const results = regex.exec(url);
        return results === null || results.length === 0 ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
    catch (ex) {
        console.log(ex);
        return null;
    }
}

async function __exec(command) {
    const { stdout, stderr } = await exec(command);
    
    if(stderr.trim() != "")
        throw stderr.trim();

    return stdout.trim();
}

async function init(src, dst) {
    await fs.rm(dst, { recursive: true, force: true });
    await fs.access(src);
    await fs.mkdir(dst, { recursive: true });
}

const MODULE_ROOT = `${__dirname}/..`
const DOCS_ROOT = path.resolve(`./docs`);
const DIST_ROOT = path.resolve(`./dist`);

const TOC_CONTAINER_TEMPLATE = `<aside>
    <div>
        <h2>on this page</h2>
    </div>
    <div id="toc-container"></div>
</aside>`;

const HTML_CONTENT_TEMPLATE = `<main>{{{html}}}</main>`;

const HEADLESS_CONTAINER_TEMPLATE = `<div class="headless-container"></div>`;

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

const TABS_TEMPLATE = `<div class="tabs-container">
    <div class="tabs-list-container">
        <ul>
            {{#items}}
            <li><a href="#{{id}}">{{text}}</a></li>
            {{/items}}
        </ul>
    </div>
    <div class="tabs-panels-container">
        {{#items}}
        <div id="{{id}}">
            {{{el}}}
        </div>
        {{/items}}
    </div>
</div>`;

const FIGURE_TEMPLATE = `<div data-fullscreen>
    <figure class="{{align}}">
        {{{img}}}
    </figure>
</div>`;

const HTML_TEMPLATE = `<!DOCTYPE HTML>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<title>{{title}}</title>
    <link rel="stylesheet" type="text/css" href="{{{root}}}assets/style/style.css" />
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Mulish:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">

    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/themes/prism-okaidia.min.css" rel="stylesheet" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/plugins/line-numbers/prism-line-numbers.min.css" rel="stylesheet" />
    
    <link rel="icon" type="image/svg+xml" href="{{{root}}}assets/images/favicon.svg" />
    <link rel="icon" type="image/png" href="{{{root}}}assets/images/favicon-32x32.png" sizes="32x32" />
    <link rel="icon" type="image/png" href="{{{root}}}assets/images/favicon-16x16.png" sizes="16x16" />
</head>
<body class="line-numbers {{#git.is_feature_branch}}feature{{/git.is_feature_branch}}">
    <header>
        <div class="container">
            <div class="bar">
                <h1 class="title">{{title}}</title></h1>
                
                <div class="nav">
                    <a href="#git-branch-menu" class="menu-toggle menu-toggle-branches" aria-controls="git-branch-menu" aria-expanded="false">
                        <span class="icon">
                            <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-git-branch">
                                <path fill-rule="evenodd" d="M11.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122V6A2.5 2.5 0 0110 8.5H6a1 1 0 00-1 1v1.128a2.251 2.251 0 11-1.5 0V5.372a2.25 2.25 0 111.5 0v1.836A2.492 2.492 0 016 7h4a1 1 0 001-1v-.628A2.25 2.25 0 019.5 3.25zM4.25 12a.75.75 0 100 1.5.75.75 0 000-1.5zM3.5 3.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0z"></path>
                            </svg>
                            </span>
                        <span class="label">{{{git.branch}}}</span>
                    </a>
                    
                    <a href="https://github.com/{{{git.repository}}}/tree/{{{git.branch}}}{{source_file}}" class="github">
                        <span class="icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" title="GitHub">
                                <path d="M5.88298 18.653C5.58298 18.453 5.32498 18.198 5.02298 17.837C4.86622 17.6452 4.71089 17.4522 4.55698 17.258C4.09398 16.683 3.80198 16.418 3.49998 16.309C3.25028 16.2194 3.04641 16.0342 2.93324 15.7943C2.82006 15.5543 2.80684 15.2792 2.89648 15.0295C2.98612 14.7798 3.17129 14.576 3.41124 14.4628C3.65119 14.3496 3.92628 14.3364 4.17598 14.426C4.92798 14.696 5.43698 15.161 6.12298 16.014C6.02898 15.897 6.46298 16.441 6.55598 16.553C6.74598 16.78 6.88598 16.918 6.99598 16.991C7.19998 17.128 7.58298 17.187 8.14598 17.131C8.16898 16.749 8.23998 16.378 8.34798 16.036C5.37998 15.31 3.69998 13.396 3.69998 9.64002C3.69998 8.40002 4.06998 7.28402 4.75798 6.34802C4.53998 5.45402 4.57298 4.37302 5.05998 3.15602C5.11525 3.01836 5.20045 2.89471 5.30942 2.79405C5.41838 2.69339 5.54838 2.61823 5.68998 2.57402C5.77098 2.55002 5.81698 2.53902 5.89798 2.52702C6.70098 2.40402 7.83498 2.69702 9.31298 3.62302C10.1938 3.41711 11.0954 3.31375 12 3.31502C12.912 3.31502 13.818 3.41902 14.684 3.62302C16.161 2.69002 17.297 2.39702 18.106 2.52702C18.191 2.54002 18.263 2.55702 18.324 2.57702C18.4628 2.6228 18.5899 2.69846 18.6963 2.79867C18.8028 2.89887 18.8859 3.0212 18.94 3.15702C19.427 4.37302 19.46 5.45402 19.242 6.34702C19.933 7.28302 20.3 8.39202 20.3 9.64002C20.3 13.397 18.626 15.305 15.658 16.032C15.783 16.447 15.848 16.911 15.848 17.412C15.8481 18.3174 15.8441 19.2227 15.836 20.128C16.0606 20.177 16.2614 20.3019 16.4047 20.4816C16.548 20.6613 16.625 20.8849 16.6228 21.1147C16.6206 21.3446 16.5392 21.5667 16.3925 21.7436C16.2457 21.9205 16.0425 22.0414 15.817 22.086C14.678 22.314 13.834 21.554 13.834 20.561L13.836 20.115L13.841 19.41C13.846 18.702 13.848 18.072 13.848 17.412C13.848 16.715 13.665 16.26 13.423 16.052C12.762 15.482 13.097 14.397 13.963 14.3C16.93 13.967 18.3 12.818 18.3 9.64002C18.3 8.68502 17.988 7.89602 17.387 7.23602C17.2604 7.09727 17.1754 6.92565 17.1418 6.74083C17.1082 6.55602 17.1273 6.36547 17.197 6.19102C17.363 5.77702 17.434 5.23402 17.293 4.57702L17.283 4.58002C16.792 4.71902 16.173 5.02002 15.425 5.52902C15.3044 5.61088 15.1673 5.66537 15.0234 5.68869C14.8795 5.71201 14.7323 5.70359 14.592 5.66402C13.7479 5.43031 12.8758 5.31289 12 5.31502C11.11 5.31502 10.228 5.43402 9.40798 5.66502C9.2682 5.70428 9.12155 5.71263 8.97821 5.68949C8.83488 5.66635 8.69831 5.61227 8.57798 5.53102C7.82598 5.02402 7.20398 4.72402 6.70998 4.58402C6.56598 5.23702 6.63698 5.77802 6.80198 6.19102C6.87179 6.36538 6.89108 6.55587 6.85766 6.74068C6.82423 6.9255 6.73944 7.09716 6.61298 7.23602C6.01598 7.89002 5.69998 8.69402 5.69998 9.64002C5.69998 12.812 7.07098 13.968 10.022 14.3C10.887 14.397 11.223 15.477 10.566 16.048C10.374 16.216 10.137 16.78 10.137 17.412V20.562C10.137 21.548 9.30198 22.287 8.17698 22.09C7.94875 22.0499 7.74151 21.9319 7.5907 21.7559C7.43988 21.58 7.35484 21.3572 7.35012 21.1255C7.3454 20.8938 7.42128 20.6677 7.5648 20.4857C7.70832 20.3038 7.91057 20.1774 8.13698 20.128V19.138C7.22698 19.199 6.47498 19.05 5.88298 18.653V18.653Z" />
                            </svg>
                        </span>
                    </a>
                    
                    <a href="#menu" class="menu-toggle menu-toggle-pages" aria-controls="menu" aria-expanded="false"><span class="label">Menu</span></a>
                </div>
            </div>
            
            <!-- Tekst in span tonen met branch icoon ervoor en dropdown pijl erachter. Bij klikken moet er een menu uitschuiven met a hrefs. -->
            <nav id="git-branch-menu">
                <span>{{{git.branch}}}</span>
            </nav>

            <nav id="menu">
                {{{menu}}}
            </nav>
        </div>
    </header>    
    
    {{{content}}}
    
    <footer></footer>
    
    <script src="{{{root}}}assets/script/iframeResizer.min.js"></script>
    
    <script src="{{{root}}}assets/bpmn-js-dist/bpmn-viewer.production.min.js"></script>    
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/components/prism-core.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/plugins/autoloader/prism-autoloader.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/plugins/line-numbers/prism-line-numbers.min.js"></script>

    <script src="{{{root}}}assets/script/script.js" charset="UTF-8"></script>
    <script> 
        __init("{{{root}}}", {{{git_string}}});
    </script>
</body>
</html>`;

const BPMN_TEMPLATE = `<script>
    window.addEventListener("load", function() {
        const xml = '{{{xml}}}';
        const viewer = new BpmnJS({
            container: "#{{id}}"
        });
        let canvas;

        viewer.importXML(xml)
            .then(response => {
                if(response.warnings.length > 0) {
                    console.log("Warnings while rendering bpmn file: {{href}}", response.warnings);
                }
                
                canvas = viewer.get("canvas");
                const viewbox = canvas.viewbox();

                document.getElementById("{{id}}").style.paddingTop = (viewbox.inner.height / viewbox.inner.width * 100) + "%";
                
                canvas.zoom("fit-viewport");
                setTimeout(() => canvas.zoom("fit-viewport"), 1);
            })
            .catch(error => {
                console.log("Error rendering bpmn file: {{href}}", error);
            });
        
        window.addEventListener("resize", function() {
            canvas.zoom("fit-viewport");
        });
    });
</script><div data-fullscreen><div id="{{id}}" class="bpmn"></div></div>`;

const FEATURE_TEMPLATE = `<pre><code class="feature">{{feature}}</code></pre>`;

const OPENAPI_IFRAME_TEMPLATE = `<div data-fullscreen><iframe class="openapi" src="{{src}}" /></div>`;

const ASYNCAPI_IFRAME_TEMPLATE = `<div data-fullscreen><iframe class="asyncapi" src="{{src}}" /></div>`;

const JSON_FORM_IFRAME_TEMPLATE = `<iframe class="json-form" src="{{src}}" />`;

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

      .swagger-ui .info {
        margin-top: 0;
        padding-top: 50px;
      }
      
      .swagger-ui .wrapper {
        padding: 0 3em;
      }
    </style>
  </head>

  <body>
    <div id="root"></div>

    <script src="{{{root}}}assets/script/iframeResizer.contentWindow.min.js"></script>
    <script src="{{{root}}}assets/swagger-ui-dist/swagger-ui-bundle.js" charset="UTF-8"> </script>
    <script src="{{{root}}}assets/swagger-ui-dist/swagger-ui-standalone-preset.js" charset="UTF-8"> </script>
    <script>
    window.addEventListener("load", function() {
      // Begin Swagger UI call region
      const ui = SwaggerUIBundle({
        spec: {{{json_string}}},
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
    });
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
    
    <script src="{{{root}}}assets/script/iframeResizer.contentWindow.min.js"></script>
    <script src="{{{root}}}assets/asyncapi/html-template/js/asyncapi-ui.min.js" type="application/javascript"></script> 
    <script>
      const schema = {{{json}}};
      const config = {
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

const JSON_FORM_TEMPLATE = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>{{title}}</title>
    <link rel="stylesheet" href="{{{root}}}assets/jsonform/deps/opt/bootstrap.css" />
  </head>
  <body>
    <form></form>
    <div id="res" class="alert"></div>
    <script src="{{{root}}}assets/script/iframeResizer.contentWindow.min.js"></script>
    <script src="{{{root}}}assets/jsonform/deps/jquery.min.js"></script>
    <script src="{{{root}}}assets/jsonform/deps/underscore.js"></script>
    <script src="{{{root}}}assets/jsonform/deps/opt/jsv.js"></script>
    <script src="{{{root}}}assets/jsonform/lib/jsonform.js"></script>
    <script>
      let config = {{{json}}};
      if(!config.schema)
        config = { schema: config };
        
      $('form').jsonForm(config);
    </script>
  </body>
</html>`;

run();
