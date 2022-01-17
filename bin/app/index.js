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

const AsyncapiAnchorParser = require('../anchor-parsers/asyncapi-anchor-parser');
const BPMNAnchorParser = require('../anchor-parsers/bpmn-anchor-parser');
const CodeAnchorParser = require('../anchor-parsers/code-anchor-parser');
const DashboardAnchorParser = require('../anchor-parsers/dashboard-anchor-parser');
const FeatureAnchorParser = require('../anchor-parsers/feature-anchor-parser');
const MarkdownAnchorParser = require('../anchor-parsers/markdown-anchor-parser');
const OpenapiAnchorParser = require('../anchor-parsers/openapi-anchor-parser');
const UmlAnchorParser = require('../anchor-parsers/uml-anchor-parser');
const UserTaskAnchorParser = require('../anchor-parsers/user-task-anchor-parser');

module.exports = class App {
    #options = null;

    constructor(options) {
        this.#options = options;
        this.container = awilix.createContainer({
            injectionMode: awilix.InjectionMode.PROXY
        });
    }

    async run() {
        await this.#init(this.#options);

        const options = this.container.resolve('options');

        if (options.branches) {
            console.info();
            console.info(chalk.greenBright('ready, shutting down.....'));
            return;
        }

        await this.#parse(options);
    }

    dispose() {
        this.container.dispose();
        this.container = null;
        this.#options = null;
    }

    async #init(opts) {
        await fs.access(opts.src);

        const options = Object.assign({}, opts);

        const gitInfo = await git.info(options);

        this.container.register('gitInfo', asValue(gitInfo));

        options.dst = destinationPath(options.dst, gitInfo.branch);

        await createDestination(options);
        await createBranches(opts, gitInfo);
        await copyFiles(this._getFileTransfers(options));
        registerServices(this.container, this._getServices(options));

        this.#options = null
    }

    async #parse(options) {
        const fileParser = this.container.resolve('fileParser');

        await files.each(options.src, async (file) => {
            //Change from src to dst location.
            file = path.resolve(options.dst, path.relative(options.src, file));

            console.info();
            console.info(chalk.yellow(`parsing ${path.relative(options.dst, file)}`));

            const dir = cwd();

            //Set current working directory to file path
            chdir(path.dirname(file));

            await fileParser.parse(file);

            //Reset current working directory
            chdir(dir);
        });

        console.info();
        console.info(chalk.greenBright('ready, shutting down.....'));
    }

    //Protected
    _getFileTransfers(options) {
        const fileTransfers = [
            { src: options.src, dst: options.dst },
            { src: path.resolve(__dirname, '../../assets'), dst: path.resolve(options.dst, 'assets') },
            { src: path.resolve(__dirname, '../../node_modules/swagger-ui-dist'), dst: path.resolve(options.dst, 'assets/swagger-ui-dist') },
            { src: path.resolve(__dirname, '../../node_modules/bpmn-js/dist/bpmn-viewer.production.min.js'), dst: path.resolve(options.dst, 'assets/bpmn-js-dist') },
            { src: path.resolve(__dirname, '../../node_modules/@asyncapi/html-template/template'), dst: path.resolve(options.dst, 'assets/asyncapi/html-template') },
            { src: path.resolve(__dirname, '../../node_modules/prismjs/components'), dst: path.resolve(options.dst, 'assets/prismjs/components') },
            { src: path.resolve(__dirname, '../../node_modules/prismjs/plugins/autoloader/prism-autoloader.min.js'), dst: path.resolve(options.dst, 'assets/prismjs') },
            { src: path.resolve(__dirname, '../../node_modules/prismjs/plugins/line-numbers/prism-line-numbers.min.js'), dst: path.resolve(options.dst, 'assets/prismjs') },
            { src: path.resolve(__dirname, '../../node_modules/prismjs/plugins/line-numbers/prism-line-numbers.min.css'), dst: path.resolve(options.dst, 'assets/prismjs') },
            { src: path.resolve(__dirname, '../../node_modules/prismjs/themes/prism-coy.min.css'), dst: path.resolve(options.dst, 'assets/prismjs') },
            { src: path.resolve(__dirname, '../../node_modules/iframe-resizer/js'), dst: path.resolve(options.dst, 'assets/iframe-resizer-dist') }
        ];

        if (options.theme) {
            fileTransfers.push({ src: options.theme, dst: path.resolve(options.dst, 'assets/style/custom-theme.css') });
        }

        return fileTransfers;
    }

    //Protected
    _getServices(options) {
        return {
            'options': asValue(options),

            //Utils
            'testExecutionStore': asClass(TestExecutionStore).singleton(),
            'menu': asClass(Menu).singleton(),
            'markdownRenderer': asClass(MarkdownRenderer).singleton(),

            //File parser
            'fileParser': asClass(CompositeFileParser).singleton(),
            'markdownFileParser': asClass(MarkdownFileParser).singleton(),

            //HTML parser
            'anchorHtmlParser': asClass(AnchorHtmlParser).singleton(),
            'cleanUpHtmlParser': asClass(CleanUpHtmlParser).singleton(),
            'fullscreenHtmlParser': asClass(FullscreenHtmlParser).singleton(),
            'headingHtmlParser': asClass(HeadingHtmlParser).singleton(),
            'imageHtmlParser': asClass(ImageHtmlParser).singleton(),
            'unsortedListHtmlParser': asClass(UnsortedListHtmlParser).singleton(),

            //Anchor parser
            'asyncapiAnchorParser': asClass(AsyncapiAnchorParser).singleton(),
            'bpmnAnchorParser': asClass(BPMNAnchorParser).singleton(),
            'codeAnchorParser': asClass(CodeAnchorParser).singleton(),
            'dashboardAnchorParser': asClass(DashboardAnchorParser).singleton(),
            'featureAnchorParser': asClass(FeatureAnchorParser).singleton(),
            'markdownAnchorParser': asClass(MarkdownAnchorParser).singleton(),
            'openapiAnchorParser': asClass(OpenapiAnchorParser).singleton(),
            'umlAnchorParser': asClass(UmlAnchorParser).singleton(),
            'userTaskAnchorParser': asClass(UserTaskAnchorParser).singleton(),

            //Component
            'asyncapiComponent': asClass(AsyncapiComponent).singleton().inject(container => allowUnregistered(container, 'asyncapiComponentRenderFn')),
            'bpmnComponent': asClass(BpmnComponent).singleton().inject(container => allowUnregistered(container, 'bpmnComponentRenderFn')),
            'dashboardComponent': asClass(DashboardComponent).singleton().inject(container => allowUnregistered(container, 'dashboardComponentRenderFn')),
            'featureComponent': asClass(FeatureComponent).singleton().inject(container => allowUnregistered(container, 'featureComponentRenderFn')),
            'fullscreenComponent': asClass(FullscreenComponent).singleton().inject(container => allowUnregistered(container, 'fullscreenComponentRenderFn')),
            'iFrameComponent': asClass(IFrameComponent).singleton().inject(container => allowUnregistered(container, 'iFrameComponentRenderFn')),
            'imageComponent': asClass(ImageComponent).singleton().inject(container => allowUnregistered(container, 'imageComponentRenderFn')),
            'openapiComponent': asClass(OpenapiComponent).singleton().inject(container => allowUnregistered(container, 'openapiComponentRenderFn')),
            'pageComponent': asClass(PageComponent).singleton().inject(container => allowUnregistered(container, 'pageComponentRenderFn')),
            'tabsComponent': asClass(TabsComponent).singleton().inject(container => allowUnregistered(container, 'tabsComponentRenderFn')),
            'userTaskComponent': asClass(UserTaskComponent).singleton().inject(container => allowUnregistered(container, 'userTaskComponentRenderFn')),

            //File parsers: order can be important!
            'fileParsers': [
                'markdownFileParser'
            ],

            //Html parsers, order is important!
            'htmlParsers': [
                'headingHtmlParser',
                'anchorHtmlParser',
                'unsortedListHtmlParser',
                'imageHtmlParser',
                'fullscreenHtmlParser',
                'cleanUpHtmlParser'
            ],

            //Anchor parsers, order can be important!
            'anchorParsers': [
                'asyncapiAnchorParser',
                'bpmnAnchorParser',
                'codeAnchorParser',
                'dashboardAnchorParser',
                'featureAnchorParser',
                'markdownAnchorParser',
                'openapiAnchorParser',
                'umlAnchorParser',
                'userTaskAnchorParser'
            ]
        };
    }
}

function asArray(names) {
    return {
        names: names,
        resolve: (container, opts) => names.map(name => container.resolve(name, opts))
    }
}

function allowUnregistered(container, ...names) {
    const obj = {};
    names.forEach(name => obj[name] = container.resolve(name, { allowUnregistered: true }));
    return obj;
}

function destinationPath(src, branch) {
    if (!branch.feature)
        return src;

    return path.resolve(src, `${branch.name.replace(' ', '-').toLowerCase()}`);
};

async function createDestination(options) {
    console.info();
    console.info(chalk.yellow(`reading from source ${options.src}`));
    console.info(chalk.yellow(`writing to destination: ${options.dst}`));

    await fs.rm(options.dst, { recursive: true, force: true });
    await fs.mkdir(options.dst, { recursive: true });
}

async function createBranches(options, gitInfo) {
    console.info();
    console.info(chalk.yellow(`creating branches.json`));
    await fs.writeFile(`${options.dst}/branches.json`, JSON.stringify(gitInfo.branches));
}

async function copyFiles(fileTransfers) {
    console.info();
    console.info(chalk.yellow(`copying files:`));
    for (const fileTransfer of fileTransfers) {
        console.info(chalk.yellow(`\t* copying files from ${fileTransfer.src} to ${path.relative(cwd(), fileTransfer.dst)}`));
        await files.copy(fileTransfer.src, fileTransfer.dst);
    }
}

function registerServices(container, services) {
    console.info();
    console.info(chalk.yellow(`registering services:`));
    const parsed = {};

    for (const [key, value] of Object.entries(services)) {
        console.info(chalk.yellow(`\t* registering service ${key}`));
        parsed[key] = parseResolver(value);
    }

    container.register(parsed);
}

function parseResolver(resolver) {
    if (Array.isArray(resolver))
        return asArray(resolver);    
    
    return resolver;
}