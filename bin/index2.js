#! /usr/bin/env node

const yargs = require('yargs');
const fs = require('fs').promises;
const path = require('path');
const { chdir, cwd } = require('process');
const chalk = require('chalk-next');

const gitUtil = require('./git/git-info');
const files = require('./utils/files');
const menuUtil = require('./utils/menu');
const executionStore = require('./bdd/executions');

const CompositeFileParser = require('./file-parsers/composite-file-parser');
const MarkdownFileParser = require('./file-parsers/markdown-file-parser');

const MarkdownRenderer = require('./markdown/markdown-renderer');

const HeadingHtmlParser = require('./html-parsers/heading-html-parser');
const UnsortedListHtmlParser = require('./html-parsers/unsorted-list-html-parser');
const AnchorHtmlParser = require('./html-parsers/anchor-html-parser');
const ImageHtmlParser = require('./html-parsers/image-html-parser');
const CleanUpHtmlParser = require('./html-parsers/clean-up-html-parser');

const BPMNAnchorParser = require('./anchor-parsers/bpmn-anchor-parser');
const OpenapiAnchorParser = require('./anchor-parsers/openapi-anchor-parser');
const AsyncapiAnchorParser = require('./anchor-parsers/asyncapi-anchor-parser');
const UserTaskAnchorParser = require('./anchor-parsers/user-task-anchor-parser');
const FeatureAnchorParser = require('./anchor-parsers/feature-anchor-parser');
const DashboardAnchorParser = require('./anchor-parsers/dashboard-anchor-parser');
const MarkdownAnchorParser = require('./anchor-parsers/markdown-anchor-parser');
const UmlAnchorParser = require('./anchor-parsers/uml-anchor-parser');

async function run(options) {
    const src = path.resolve(cwd(), `docs`);
    const git = await gitUtil.getInfo();
    const dst = await init(src, path.resolve(cwd(), `dist`), git);

    if (options.branches) {
        console.info(``);
        console.log(chalk.yellow('branche only mode, quitting.....'));
        return;
    }

    await files.copy(src, dst);

    const fileParser = await createFileParser(src, dst, git);

    await files.each(dst, async (file) => {
        console.info(``);
        console.info(chalk.yellow(`parsing ${path.relative(dst, file)}`));

        const dir = cwd();

        //Set current working directory to file path
        chdir(path.dirname(file));

        await fileParser.parse(file);

        //Reset current working directory
        chdir(dir);
    });
}

async function createFileParser(src, dst, git) {
    const menu = await menuUtil.getMenu(src);
    const executions = await executionStore.getExecutions(path.resolve(cwd(), `.temp/executions`));

    return new CompositeFileParser({
        root: dst,
        parsers: [
            new MarkdownFileParser({
                root: dst,
                git: git,
                menu: menu,
                renderer: new MarkdownRenderer({
                    root: dst,
                    parsers: [
                        new HeadingHtmlParser({ root: dst }),
                        new AnchorHtmlParser({
                            root: dst,
                            parsers: [
                                new BPMNAnchorParser({ root: dst }),
                                new OpenapiAnchorParser({ root: dst }),
                                new AsyncapiAnchorParser({ root: dst }),
                                new UserTaskAnchorParser({ root: dst }),
                                new FeatureAnchorParser({
                                    root: dst,
                                    executions: executions
                                }),
                                new DashboardAnchorParser({
                                    root: dst,
                                    executions: executions
                                }),
                                new MarkdownAnchorParser({
                                    root: dst,
                                    renderer: new MarkdownRenderer({
                                        root: dst,
                                        parsers: [
                                            new HeadingHtmlParser({ root: dst }),
                                            new AnchorHtmlParser({
                                                root: dst,
                                                parsers: [
                                                    new BPMNAnchorParser({ root: dst }),
                                                    new OpenapiAnchorParser({ root: dst }),
                                                    new AsyncapiAnchorParser({ root: dst }),
                                                    new UserTaskAnchorParser({ root: dst }),
                                                    new FeatureAnchorParser({
                                                        root: dst,
                                                        executions: executions
                                                    }),
                                                    new DashboardAnchorParser({
                                                        root: dst,
                                                        executions: executions
                                                    }),
                                                    // TODO: uitzoeken hoe dit moet (DI)?
                                                    // new MarkdownAnchorParser({
                                                    //     root: dst,
                                                    //     renderer: markdownRenderer
                                                    // }),
                                                    new UmlAnchorParser({ root: dst })
                                                ]
                                            }),
                                            new UnsortedListHtmlParser({ root: dst }),
                                            new ImageHtmlParser({ root: dst }),
                                            new CleanUpHtmlParser({ root: dst })
                                        ]
                                    })
                                }),
                                new UmlAnchorParser({ root: dst })
                            ]
                        }),
                        new UnsortedListHtmlParser({ root: dst }),
                        new ImageHtmlParser({ root: dst }),
                        new CleanUpHtmlParser({ root: dst })
                    ]
                })
            })
        ]
    });
}

init = async function (src, dst, git) {
    dst = createDestinationPath(dst, git.branch);

    await fs.rm(dst, { recursive: true, force: true });
    await fs.access(src);

    await fs.mkdir(dst, { recursive: true });

    await fs.writeFile(`${dst}/branches.json`, JSON.stringify(git.branches));

    console.info(``);
    console.info(chalk.yellow(`created branches.json`));

    return dst;
}

createDestinationPath = function (src, branch) {
    if (!branch.feature)
        return src;

    return path.resolve(src, `/${branch.name.replace(' ', '-').toLowerCase()}`);
};

const options = yargs
    .usage("Usage: -b")
    .option("b", { alias: "branches", describe: "Output banches only", type: "boolean", demandOption: false })
    .argv;

run(options);