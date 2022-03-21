const awilix = require('awilix');
const { asClass, asValue } = require('awilix');
const fs = require('fs').promises;
const path = require('path');
const { chdir, cwd } = require('process');
const chalk = require('chalk-next');

const git = require('../utils/git');
const files = require('../utils/files');

const Locale = require('../locale');

const Relative = require('../utils/relative');

const MarkdownRenderer = require('../utils/markdown');
const Menu = require('../utils/menu');
const TestExecutionParser = require('../utils/bdd/test-execution-parser');
const TestExecutionStore = require('../utils/bdd/test-execution-store');

const CompositeHostingService = require('../hosting/composite-hosting-service');
const AzureStaticWebApp = require('../hosting/azure-static-web-app');

const DefinitionParser = require('../utils/definitions/definition-parser');
const DefinitionStore = require('../utils/definitions/definition-store');

const CompositeFileParser = require('../file-parsers/composite-file-parser');
const MarkdownFileParser = require('../file-parsers/markdown-file-parser');
const MarkdownMessageFileParser = require('../file-parsers/markdown-message-file-parser');

const AsyncapiComponent = require('../components/asyncapi-component');
const BpmnComponent = require('../components/bpmn-component');
const DashboardComponent = require('../components/dashboard-component');
const FeatureComponent = require('../components/feature-component');
const FullscreenComponent = require('../components/fullscreen-component');
const IFrameComponent = require('../components/iframe-component');
const ImageComponent = require('../components/image-component');
const MenuComponent = require('../components/menu-component');
const MessageComponent = require('../components/message-component');
const OpenapiComponent = require('../components/openapi-component');
const PageComponent = require('../components/page-component');
const TabsComponent = require('../components/tabs-component');
const UserTaskComponent = require('../components/user-task-component');

const AnchorHtmlParser = require('../html-parsers/anchor-html-parser');
const CleanUpHtmlParser = require('../html-parsers/clean-up-html-parser');
const DefinitionHtmlParser = require('../html-parsers/definition-html-parser');
const ImageHtmlParser = require('../html-parsers/image-html-parser');
const FullscreenHtmlParser = require('../html-parsers/fullscreen-html-parser');
const HeadingHtmlParser = require('../html-parsers/heading-html-parser');
const MenuHtmlParser = require('../html-parsers/menu-html-parser');
const UnsortedListHtmlParser = require('../html-parsers/unsorted-list-html-parser');

const AsyncapiAnchorParser = require('../anchor-parsers/asyncapi-anchor-parser');
const BPMNAnchorParser = require('../anchor-parsers/bpmn-anchor-parser');
const CodeAnchorParser = require('../anchor-parsers/code-anchor-parser');
const DashboardAnchorParser = require('../anchor-parsers/dashboard-anchor-parser');
const FeatureAnchorParser = require('../anchor-parsers/feature-anchor-parser');
const FeaturesAnchorParser = require('../anchor-parsers/features-anchor-parser');
const MarkdownAnchorParser = require('../anchor-parsers/markdown-anchor-parser');
const MarkdownMessageAnchorParser = require('../anchor-parsers/markdown-message-anchor-parser');
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

        const hosting = this.container.resolve('hosting');
        await hosting.apply();

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
        options.basePath = options.dst;

        const gitInfo = await git.info(options);

        this.container.register('gitInfo', asValue(gitInfo));        
        options.dst = path.resolve(options.dst, gitInfo.branch.path);

        await createDestination(options);
        await createBranches(opts, gitInfo);
        await copyFiles(this._getFileTransfers(options));

        registerServices(this.container, this._getServices(options));

        // Init stores
        console.info();
        console.info(chalk.greenBright('Initializing stores....'));

        await this.container.resolve('defintionStore').init();
        await this.container.resolve('locale').init();
        await this.container.resolve('menu').init();        
        await this.container.resolve('testExecutionStore').init();

        this.#options = null;
    }

    async #parse(options) {
        const fileParser = this.container.resolve('fileParser');

        await files.each(options.dst, async (file) => {
            // //Change from src to dst location.
            // file = path.resolve(options.dst, path.relative(options.src, file));

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
            { src: options.assets, dst: path.resolve(options.dst, 'assets') },
            
            { src: path.resolve(options.nodeModules, 'swagger-ui-dist/favicon-16x16.png'), dst: path.resolve(options.dst, 'assets/swagger-ui-dist') },
            { src: path.resolve(options.nodeModules, 'swagger-ui-dist/favicon-32x32.png'), dst: path.resolve(options.dst, 'assets/swagger-ui-dist') },
            { src: path.resolve(options.nodeModules, 'swagger-ui-dist/swagger-ui.css'), dst: path.resolve(options.dst, 'assets/swagger-ui-dist') },
            { src: path.resolve(options.nodeModules, 'swagger-ui-dist/swagger-ui.css.map'), dst: path.resolve(options.dst, 'assets/swagger-ui-dist') },
            { src: path.resolve(options.nodeModules, 'swagger-ui-dist/swagger-ui-bundle.js'), dst: path.resolve(options.dst, 'assets/swagger-ui-dist') },
            { src: path.resolve(options.nodeModules, 'swagger-ui-dist/swagger-ui-bundle.js.map'), dst: path.resolve(options.dst, 'assets/swagger-ui-dist') },
            { src: path.resolve(options.nodeModules, 'swagger-ui-dist/swagger-ui-standalone-preset.js'), dst: path.resolve(options.dst, 'assets/swagger-ui-dist') },
            { src: path.resolve(options.nodeModules, 'swagger-ui-dist/swagger-ui-standalone-preset.js.map'), dst: path.resolve(options.dst, 'assets/swagger-ui-dist') },

            { src: path.resolve(options.nodeModules, 'bpmn-js/dist/bpmn-viewer.production.min.js'), dst: path.resolve(options.dst, 'assets/bpmn-js-dist') },

            { src: path.resolve(options.nodeModules, '@asyncapi/html-template/template/css/global.min.css'), dst: path.resolve(options.dst, 'assets/asyncapi/html-template') },
            { src: path.resolve(options.nodeModules, '@asyncapi/html-template/template/css/asyncapi.min.css'), dst: path.resolve(options.dst, 'assets/asyncapi/html-template') },
            { src: path.resolve(options.nodeModules, '@asyncapi/html-template/template/js/asyncapi-ui.min.js'), dst: path.resolve(options.dst, 'assets/asyncapi/html-template') },
            
            { src: path.resolve(options.nodeModules, 'prismjs/components'), dst: path.resolve(options.dst, 'assets/prismjs/components') },
            { src: path.resolve(options.nodeModules, 'prismjs/plugins/autoloader/prism-autoloader.min.js'), dst: path.resolve(options.dst, 'assets/prismjs') },
            { src: path.resolve(options.nodeModules, 'prismjs/plugins/line-numbers/prism-line-numbers.min.js'), dst: path.resolve(options.dst, 'assets/prismjs') },
            { src: path.resolve(options.nodeModules, 'prismjs/plugins/line-numbers/prism-line-numbers.min.css'), dst: path.resolve(options.dst, 'assets/prismjs') },
            { src: path.resolve(options.nodeModules, 'prismjs/themes/prism-coy.min.css'), dst: path.resolve(options.dst, 'assets/prismjs') },
            
            { src: path.resolve(options.nodeModules, 'iframe-resizer/js'), dst: path.resolve(options.dst, 'assets/iframe-resizer-dist') },

            { src: options.src, dst: options.dst }
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
            'testExecutionParser': asClass(TestExecutionParser).singleton(),
            'testExecutionStore': asClass(TestExecutionStore).singleton(),
            'menu': asClass(Menu).singleton(),
            'markdownRenderer': asClass(MarkdownRenderer).singleton(),
            'locale': asClass(Locale).singleton(),
            'relative': asClass(Relative).singleton(),

            //Hosting services
            'hosting': asClass(CompositeHostingService).singleton(),
            'azureStaticWebApp': asClass(AzureStaticWebApp).singleton(),

            //Defintions
            'defintionParser': asClass(DefinitionParser).singleton(),
            'defintionStore': asClass(DefinitionStore).singleton(),

            //File parser
            'fileParser': asClass(CompositeFileParser).singleton(),
            'markdownFileParser': asClass(MarkdownFileParser).singleton(),
            'markdownMessageFileParser': asClass(MarkdownMessageFileParser).singleton(),

            //HTML parser
            'anchorHtmlParser': asClass(AnchorHtmlParser).singleton(),
            'cleanUpHtmlParser': asClass(CleanUpHtmlParser).singleton(),
            'definitionHtmlParser': asClass(DefinitionHtmlParser).singleton(),
            'fullscreenHtmlParser': asClass(FullscreenHtmlParser).singleton(),
            'headingHtmlParser': asClass(HeadingHtmlParser).singleton(),
            'imageHtmlParser': asClass(ImageHtmlParser).singleton(),
            'menuHtmlParser': asClass(MenuHtmlParser).singleton(),
            'unsortedListHtmlParser': asClass(UnsortedListHtmlParser).singleton(),

            //Anchor parser
            'asyncapiAnchorParser': asClass(AsyncapiAnchorParser).singleton(),
            'bpmnAnchorParser': asClass(BPMNAnchorParser).singleton(),
            'codeAnchorParser': asClass(CodeAnchorParser).singleton(),
            'dashboardAnchorParser': asClass(DashboardAnchorParser).singleton(),
            'featureAnchorParser': asClass(FeatureAnchorParser).singleton(),
            'featuresAnchorParser': asClass(FeaturesAnchorParser).singleton(),
            'markdownAnchorParser': asClass(MarkdownAnchorParser).singleton(),
            'markdownMessageAnchorParser': asClass(MarkdownMessageAnchorParser).singleton(),
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
            'menuComponent': asClass(MenuComponent).singleton().inject(container => allowUnregistered(container, 'menuComponentRenderFn')),
            'messageComponent': asClass(MessageComponent).singleton().inject(container => allowUnregistered(container, 'messageComponentRenderFn')),
            'openapiComponent': asClass(OpenapiComponent).singleton().inject(container => allowUnregistered(container, 'openapiComponentRenderFn')),
            'pageComponent': asClass(PageComponent).singleton().inject(container => allowUnregistered(container, 'pageComponentRenderFn')),
            'tabsComponent': asClass(TabsComponent).singleton().inject(container => allowUnregistered(container, 'tabsComponentRenderFn')),
            'userTaskComponent': asClass(UserTaskComponent).singleton().inject(container => allowUnregistered(container, 'userTaskComponentRenderFn')),

            'hostingServices': [
                'azureStaticWebApp'
            ],

            //File parsers: order can be important!
            'fileParsers': [
                'markdownFileParser',
                'markdownMessageFileParser'
            ],

            //Html parsers, order is important!
            'htmlParsers': [
                'headingHtmlParser',
                'anchorHtmlParser',
                'unsortedListHtmlParser',
                'imageHtmlParser',
                'fullscreenHtmlParser',
                'menuHtmlParser',
                'definitionHtmlParser',
                'cleanUpHtmlParser'
            ],

            //Anchor parsers, order can be important!
            'anchorParsers': [
                'asyncapiAnchorParser',
                'bpmnAnchorParser',
                'codeAnchorParser',
                'dashboardAnchorParser',
                'featureAnchorParser',
                'featuresAnchorParser',
                'markdownAnchorParser',
                'markdownMessageAnchorParser',
                'openapiAnchorParser',
                'umlAnchorParser',
                'userTaskAnchorParser'
            ]
        };
    }
};

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
