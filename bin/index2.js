#! /usr/bin/env node

const yargs = require('yargs');
const fs = require('fs').promises;
const path = require('path');

const gitUtil = require('./git/git-info');
const files = require('./file/files');
const menuUtil = require('./util/menu');
const executionsUtil = require('./util/executions');

const HtmlParser = require('./html/html-parser');

const FileParser = require('./file/file-parser');

const MarkdownRenderer = require('./markdown/markdown-renderer');
const MarkdownFileParser = require('./markdown/markdown-file-parser');

const HeadingHtmlParser = require('./html/heading-html-parser');
const UnsortedListHtmlParser = require('./html/unsorted-list-html-parser');
const AnchorHtmlParser = require('./html/anchor-html-parser');
const ImageHtmlParser = require('./html/image-html-parser');
const CleanUpHtmlParser = require('./html/clean-up-html-parser');

const BPMNAnchorParser = require('./bpmn/bpmn-anchor-parser');
const OpenapiAnchorParser = require('./openapi/openapi-anchor-parser');
const AsyncapiAnchorParser = require('./asyncapi/asyncapi-anchor-parser');
const UserTaskAnchorParser = require('./user-task/user-task-anchor-parser');
const FeatureAnchorParser = require('./bdd/feature-anchor-parser');
const DashboardAnchorParser = require('./bdd/dashboard-anchor-parser');
const MarkdownAnchorParser = require('./markdown/markdown-anchor-parser');
const UmlAnchorParser = require('./uml/uml-anchor-parser');

async function run(options) {
    const src = path.resolve(`./docs`);
    const git = await gitUtil.getInfo();    
    const dst = await init(src, `./dist`, git);

    if (options.branches) {
        console.log("Branche only mode, quitting.....")
        return;
    }

    await files.copy(src, dst);
    
    const fileParser = await createFileParser(src, dst, git);
    
    await files.each(dst, async (file) => {
        console.info(`parsing ${file}`);
        
        await fileParser.parse(file);
        
        console.info(`${file} parsed`);
    });
}

async function createFileParser(src, dst, git) {
    const menu = await menuUtil.getMenu(src);
    const executions = await executionsUtil.getExecutions(path.resolve(`${src}/../temp/executions`));

    let markdownRenderer;

    const htmlParsers = [
        new HeadingHtmlParser(),
        new AnchorHtmlParser({
            parsers: [
                new BPMNAnchorParser(),
                new OpenapiAnchorParser(),
                new AsyncapiAnchorParser(),
                new UserTaskAnchorParser(),
                new FeatureAnchorParser({
                    executions: executions
                }),
                new DashboardAnchorParser({
                    executions: executions
                }),
                new MarkdownAnchorParser({
                    renderer: markdownRenderer
                }),
                new UmlAnchorParser()
            ]
        }),
        new UnsortedListHtmlParser(),
        new ImageHtmlParser(),
        new CleanUpHtmlParser()
    ];

    markdownRenderer = new MarkdownRenderer({
        parser: new HtmlParser({
            parsers: htmlParsers
        })
    });

    return new FileParser({
        root: dst,
        parsers: [
            new MarkdownFileParser({
                git: git,
                menu: menu,
                renderer: markdownRenderer
            })
        ]
    });
}

init = async function(src, dst, git) {
    dst = getBranchPath(dst, git.branch);

    await fs.rm(dst, { recursive: true, force: true });
    await fs.access(src);
    
    await fs.mkdir(dst, { recursive: true });

    await fs.writeFile(`${dst}/branches.json`, JSON.stringify(git.branches));

    console.info(`Created ${dst}/branches.json`);

    return dst;
}

getBranchPath = function (src, branch) {
    if (!branch.feature)
        return src;
    
    return path.resolve(src, `/${branch.name.replace(' ', '-').toLowerCase() }`);
};

const options = yargs
    .usage("Usage: -b")
    .option("b", { alias: "branches", describe: "Output banches only", type: "boolean", demandOption: false })
    .argv;

run(options);