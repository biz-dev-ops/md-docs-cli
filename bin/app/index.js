const awilix = require('awilix');
const { asClass, asValue } = require('awilix');
const fs = require('fs').promises;
const path = require('path');
const { chdir, cwd } = require('process');
const chalk = require('chalk-next');

const git = require('../utils/git');
const files = require('../utils/files');

const MarkdownRenderer = require('../utils/markdown');
const Menu = require('../utils/menu');
const TestExecutionStore = new require('../utils/bdd/test-execution-store');

const CompositeFileParser = require('../file-parsers/composite-file-parser');
const MarkdownFileParser = require('../file-parsers/markdown-file-parser');

const AsyncapiComponent = require('../components/asyncapi-component');
const BpmnComponent = require('../components/bpmn-component');
const DashboardComponent = require('../components/dashboard-component');
const FeatureComponent = require('../components/feature-component');
const FullscreenComponent = require('../components/fullscreen-component');
const IFrameComponent = require('../components/iframe-component');
const ImageComponent = require('../components/image-component');
const OpenapiComponent = require('../components/openapi-component');
const PageComponent = require('../components/page-component');
const TabsComponent = require('../components/tabs-component');
const UserTaskComponent = require('../components/user-task-component');

const HeadingHtmlParser = require('../html-parsers/heading-html-parser');
const UnsortedListHtmlParser = require('../html-parsers/unsorted-list-html-parser');
const AnchorHtmlParser = require('../html-parsers/anchor-html-parser');
const ImageHtmlParser = require('../html-parsers/image-html-parser');
const FullscreenHtmlParser = require('../html-parsers/fullscreen-html-parser');
const CleanUpHtmlParser = require('../html-parsers/clean-up-html-parser');

const BPMNAnchorParser = require('../anchor-parsers/bpmn-anchor-parser');
const OpenapiAnchorParser = require('../anchor-parsers/openapi-anchor-parser');
const AsyncapiAnchorParser = require('../anchor-parsers/asyncapi-anchor-parser');
const UserTaskAnchorParser = require('../anchor-parsers/user-task-anchor-parser');
const FeatureAnchorParser = require('../anchor-parsers/feature-anchor-parser');
const DashboardAnchorParser = require('../anchor-parsers/dashboard-anchor-parser');
const MarkdownAnchorParser = require('../anchor-parsers/markdown-anchor-parser');
const UmlAnchorParser = require('../anchor-parsers/uml-anchor-parser');

module.exports = class App {
    #options = null;

    constructor(options) {
        this.#options = options;
        this.container = awilix.createContainer({
            injectionMode: awilix.InjectionMode.PROXY,
            allowUnregistered: true
        });
    }

    async run() {
        await this.#init(this.#options);
        const options = this.container.resolve('options');
        await this.#exec(options);
    }

    async #exec(options) {
        if (options.branches) {
            console.info(``);
            console.log(chalk.yellow('branche only mode, quitting.....'));
            return;
        }

        const fileParser = this.container.resolve('fileParser');

        await files.each(options.src, async (file) => {
            //Change from src to dst location.
            file = path.resolve(options.dst, path.relative(options.src, file));

            console.info(``);
            console.info(chalk.yellow(`parsing ${path.relative(options.dst, file)}`));

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

    async #init(opts) {
        await fs.access(opts.src);

        console.log(chalk.yellow(`reading from ${opts.src}`));

        const options = Object.assign({}, opts);

        const gitInfo = await git.info();

        this.container.register('gitInfo', asValue(gitInfo));

        options.dst = destinationPath(options.dst, gitInfo.branch);

        console.log(chalk.yellow(`writing to ${options.src}`));

        await fs.rm(options.dst, { recursive: true, force: true });
        await fs.mkdir(options.dst, { recursive: true });

        console.info(chalk.yellow(`creating branches.json`));
        await fs.writeFile(`${options.dst}/branches.json`, JSON.stringify(gitInfo.branches));

        if (options.branches)
            return;

        console.log(chalk.yellow(`copying files:`));
        for (const fileTransfer of this._getFileTransfers(options)) {
            console.log(chalk.yellow(`\t* copying files from ${fileTransfer.src} to ${path.relative(cwd(), fileTransfer.dst)}`));
            await files.copy(fileTransfer.src, fileTransfer.dst);
        }

        console.log(chalk.yellow(`registering services:`));
        const services = this._getServices(options);

        for (const service of Object.keys(services)) {
            console.log(chalk.yellow(`\t* registering service ${service}`));
        }

        this.container.register(services);

        this.#options = null
    }

    //Protected
    _getFileTransfers(options) {
        return [
            { src: options.src, dst: options.dst },
            { src: path.resolve(__dirname, '../../assets'), dst: path.resolve(options.dst, 'assets') },
            { src: path.resolve(__dirname, '../../node_modules/swagger-ui-dist'), dst: path.resolve(options.dst, 'assets/swagger-ui-dist') },
            { src: path.resolve(__dirname, '../../node_modules/bpmn-js/dist'), dst: path.resolve(options.dst, 'assets/bpmn-js-dist') },
            { src: path.resolve(__dirname, '../../node_modules/@asyncapi/html-template/template'), dst: path.resolve(options.dst, 'assets/asyncapi/html-template') },
            { src: path.resolve(__dirname, '../../node_modules/iframe-resizer/js'), dst: path.resolve(options.dst, 'assets/iframe-resizer-dist') }
        ]
    }

    //Protected
    _getServices(options) {
        return {
            'options': asValue(options),

            //Utils
            'testExecutionStore': asClass(TestExecutionStore),
            'menu': asClass(Menu),
            'markdownRenderer': asClass(MarkdownRenderer),

            //File parser
            'fileParser': asClass(CompositeFileParser),

            //File parsers: order can be important!
            'fileParsers': asArray([
                asClass(MarkdownFileParser)
            ]),

            //Html parsers, order is important!
            'htmlParsers': asArray([
                asClass(HeadingHtmlParser),
                asClass(AnchorHtmlParser),
                asClass(UnsortedListHtmlParser),
                asClass(ImageHtmlParser),
                asClass(FullscreenHtmlParser),
                asClass(CleanUpHtmlParser)
            ]),

            //Anchor parsers, order can be important!
            'anchorParsers': asArray([
                asClass(AsyncapiAnchorParser),
                asClass(BPMNAnchorParser),
                asClass(DashboardAnchorParser),
                asClass(FeatureAnchorParser),
                asClass(MarkdownAnchorParser),
                asClass(OpenapiAnchorParser),
                asClass(UmlAnchorParser),
                asClass(UserTaskAnchorParser)
            ]),

            //Components
            'asyncapiComponent': asClass(AsyncapiComponent).inject(c => ({ asyncapiComponentRenderFn: c.resolve('asyncapiComponentRenderFn', { allowUnregistered: true }) })),
            'bpmnComponent': asClass(BpmnComponent).inject(c => ({ bpmnComponentRenderFn: c.resolve('bpmnComponentRenderFn', { allowUnregistered: true }) })),
            'dashboardComponent': asClass(DashboardComponent).inject(c => ({ dashboardComponentRenderFn: c.resolve('dashboardComponentRenderFn', { allowUnregistered: true }) })),
            'featureComponent': asClass(FeatureComponent).inject(c => ({ featureComponentRenderFn: c.resolve('featureComponentRenderFn', { allowUnregistered: true }) })),
            'fullscreenComponent': asClass(FullscreenComponent).inject(c => ({ fullscreenComponentRenderFn: c.resolve('fullscreenComponentRenderFn', { allowUnregistered: true }) })),
            'iFrameComponent': asClass(IFrameComponent).inject(c => ({ iFrameComponentRenderFn: c.resolve('iFrameComponentRenderFn', { allowUnregistered: true }) })),
            'imageComponent': asClass(ImageComponent).inject(c => ({ imageComponentRenderFn: c.resolve('imageComponentRenderFn', { allowUnregistered: true }) })),
            'openapiComponent': asClass(OpenapiComponent).inject(c => ({ openapiComponentRenderFn: c.resolve('openapiComponentRenderFn', { allowUnregistered: true }) })),
            'pageComponent': asClass(PageComponent).inject(c => ({ pageComponentRenderFn: c.resolve('pageComponentRenderFn', { allowUnregistered: true }) })),
            'tabsComponent': asClass(TabsComponent).inject(c => ({ tabsComponentRenderFn: c.resolve('tabsComponentRenderFn', { allowUnregistered: true }) })),
            'userTaskComponent': asClass(UserTaskComponent).inject(c => ({ userTaskComponentRenderFn: c.resolve('userTaskComponentRenderFn', { allowUnregistered: true }) }))
        };
    }
}

function asArray(resolvers) {
    return {
        resolve: (container, opts) => resolvers.map(r => container.build(r, opts))
    }
}

function destinationPath(src, branch) {
    if (!branch.feature)
        return src;

    return path.resolve(src, `/${branch.name.replace(' ', '-').toLowerCase()}`);
};