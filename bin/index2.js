#! /usr/bin/env node

const yargs = require('yargs');
const fs = require('fs').promises;
const path = require('path');

const gitUtil = require('./git/git-info');
const files = require('./file/files');
const menuUtil = require('./util/menu');
const executionsUtil = require('./util/executions');

const FileParser = require('./file/file-parser');
const MarkdownFileParser = require('./markdown/markdown-file-parser');

const HtmlParser = require('./html/html-parser');
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
    //TODO: nodejs dir helpers uitzoeken.
    const src = path.resolve(`./docs`);

    const git = await gitUtil.getInfo();
    const dst = path.resolve(`./dist${git.path}`);
    
    await init(src, dst, git);

    if (options.branches) {
        console.log("Branche only mode, quitting.....")
        return;
    }

    await files.copy(src, dst);
    const fileParser = await createFileParser(src, git);    
    await files.each(dst, async (file) => await fileParser.parse(file));
}

async function createFileParser(src, git) {
    const menu = await menuUtil.getMenu(src);
    const executions = await executionsUtil.getExecutions(path.resolve(`${src}/../temp/executions`));

    return new FileParser({
        parsers: [
            new MarkdownFileParser({
                git: git,
                menu: menu,
                parser: new HtmlParser({
                    parsers: [
                        new HeadingHtmlParser(),
                        new AnchorHtmlParser({
                            parsers: [
                                BPMNAnchorParser(),
                                OpenapiAnchorParser(),
                                AsyncapiAnchorParser(),
                                UserTaskAnchorParser(),
                                FeatureAnchorParser(executions),
                                DashboardAnchorParser(executions),
                                MarkdownAnchorParser(),
                                UmlAnchorParser()
                            ]
                        }),
                        new UnsortedListHtmlParser(),
                        new ImageHtmlParser(),
                        new CleanUpHtmlParser()
                    ]
                })
            })
        ]
    });
}

async function init(src, dst, git) {
    await fs.rm(dst, { recursive: true, force: true });
    await fs.access(src);
    
    await fs.mkdir(dst, { recursive: true });

    await fs.writeFile(`${dst}/branches.json`, JSON.stringify(git.branches));

    console.log(`Created ${dst}/branches.json`);
}

const options = yargs
    .usage("Usage: -b")
    .option("b", { alias: "branches", describe: "Output banches only", type: "boolean", demandOption: false })
    .argv;

run(options);