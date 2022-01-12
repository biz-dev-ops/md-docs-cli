#! /usr/bin/env node

const yargs = require('yargs');
const fs = require('fs').promises;
const path = require('path');
const { chdir, cwd } = require('process');
const chalk = require('chalk-next');

const git = require('./utils/git');
const files = require('./utils/files');
const MarkdownRenderer = require('./utils/markdown');
const Menu = require('./utils/menu');
const TestExecutionStore = new require('./utils/bdd/test-execution-store');

const CompositeFileParser = require('./file-parsers/composite-file-parser');
const MarkdownFileParser = require('./file-parsers/markdown-file-parser');

const HeadingHtmlParser = require('./html-parsers/heading-html-parser');
const UnsortedListHtmlParser = require('./html-parsers/unsorted-list-html-parser');
const AnchorHtmlParser = require('./html-parsers/anchor-html-parser');
const ImageHtmlParser = require('./html-parsers/image-html-parser');
const FullscreenHtmlParser = require('./html-parsers/fullscreen-html-parser');
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

    const gitInfo = await git.info();

    const dst = await init(src, path.resolve(cwd(), `dist`), gitInfo);

    if (options.branches) {
        console.info(``);
        console.log(chalk.yellow('branche only mode, quitting.....'));
        return;
    }
        
    const testExecutionStore = new TestExecutionStore({ target: path.resolve(cwd(), `.temp/executions`) });
    const menu = new Menu({ target: dst });

    const testExecutions = await testExecutionStore.get();
    const menuItems = await menu.items();

    const fileParser = await createFileParser(dst, gitInfo, testExecutions, menuItems);    

    await files.each(src, async (file) => {
        //Change from src to dst location.
        file = path.resolve(dst, path.relative(src, file));

        console.info(``);
        console.info(chalk.yellow(`parsing ${path.relative(dst, file)}`));

        const dir = cwd();

        //Set current working directory to file path
        chdir(path.dirname(file));

        await fileParser.parse(file);

        //Reset current working directory
        chdir(dir);       
    });


    console.log('');
    console.log(chalk.greenBright('ready, shutting down.....'));
}

async function createFileParser(dst, gitInfo, testExecutions, menuItems) {
    return new CompositeFileParser({
        root: dst,
        parsers: [
            new MarkdownFileParser({
                root: dst,
                git: gitInfo,
                menu: menuItems,
                renderer: new MarkdownRenderer({
                    root: dst,
                    parsers: [
                        new HeadingHtmlParser({ root: dst }),
                        new AnchorHtmlParser({
                            root: dst,
                            parsers: [
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
                                                        executions: testExecutions
                                                    }),
                                                    new DashboardAnchorParser({
                                                        root: dst,
                                                        executions: testExecutions
                                                    }),
                                                    // TODO: uitzoeken hoe dit moet (DI)?
                                                    // new MarkdownAnchorParser({
                                                    //     root: dst,
                                                    //     renderer: markdownRenderer
                                                    // }),
                                                    new UmlAnchorParser({ root: dst })
                                                ]
                                            }),
                                            new FullscreenHtmlParser({ root: dst }),
                                            new UnsortedListHtmlParser({ root: dst }),
                                            new CleanUpHtmlParser({ root: dst })
                                        ]
                                    })
                                }),
                                new BPMNAnchorParser({ root: dst }),
                                new OpenapiAnchorParser({ root: dst }),
                                new AsyncapiAnchorParser({ root: dst }),
                                new UserTaskAnchorParser({ root: dst }),
                                new FeatureAnchorParser({
                                    root: dst,
                                    executions: testExecutions
                                }),
                                new DashboardAnchorParser({
                                    root: dst,
                                    executions: testExecutions
                                }),
                                new UmlAnchorParser({ root: dst })
                            ]
                        }),
                        new UnsortedListHtmlParser({ root: dst }),
                        new ImageHtmlParser({ root: dst }),
                        new FullscreenHtmlParser({ root: dst }),
                        new CleanUpHtmlParser({ root: dst })
                    ]
                })
            })
        ]
    });
}

init = async function (src, dst, gitInfo) {
    dst = createDestinationPath(dst, gitInfo.branch);

    await fs.rm(dst, { recursive: true, force: true });
    await fs.access(src);

    await fs.mkdir(dst, { recursive: true });

    await fs.writeFile(`${dst}/branches.json`, JSON.stringify(gitInfo.branches));

    console.info(chalk.yellow(`created branches.json`));

    await files.copy(src, dst);
    await files.copy(path.resolve(__dirname, '../assets'), path.resolve(dst, 'assets'));
    await files.copy(path.resolve(__dirname, '../node_modules/swagger-ui-dist'), path.resolve(dst, 'assets/swagger-ui-dist'));
    await files.copy(path.resolve(__dirname, '../node_modules/bpmn-js/dist'), path.resolve(dst, 'assets/bpmn-js-dist'));
    await files.copy(path.resolve(__dirname, '../node_modules/@asyncapi/html-template/template'), path.resolve(dst, 'assets/asyncapi/html-template'));
    await files.copy(path.resolve(__dirname, '../node_modules/iframe-resizer/js'), path.resolve(dst, 'assets/iframe-resizer-dist'));

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