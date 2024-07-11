const awilix = require('awilix');
const util = require('util');
const mustache = require('mustache');
const execFile = util.promisify(require('child_process').execFile);
const { glob } = require('glob');
const { asClass, asValue } = require('awilix');
const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const colors = require('colors');

const git = require('../utils/git');
const files = require('../utils/files');

const Locale = require('../locale');

const MarkdownRenderer = require('../utils/markdown');
const Menu = require('../utils/menu');
const PageUtil = require('../utils/page-util');
const Sitemap = require('../utils/sitemap');
const CompositeFeatureParser = require("../utils/bdd/composite-feature-parser");
const CucumberTestExecutionParser = require('../utils/bdd//cucumber-test-execution-parser');
const SpecflowTestExecutionParser = require('../utils/bdd/specflow-test-execution-parser');
const TestExecutionParser = require('../utils/bdd/test-execution-parser');
const TestExecutionStore = require('../utils/bdd/test-execution-store');
const UserTaskParser = require('../utils/user-task-parser');

const CompositeHostingService = require('../hosting/composite-hosting-service');
const AzureStaticWebApp = require('../hosting/azure-static-web-app');

const DefinitionParser = require('../utils/definitions/definition-parser');
const DefinitionStore = require('../utils/definitions/definition-store');

const HeadlessBrowser = require('../utils/headless-browser');

const GherkinParser = require('../utils/bdd/gherkin-parser');

const CompositeFileParser = require('../file-parsers/composite-file-parser');
const BPMNFileParser = require('../file-parsers/bpmn-file-parser');
const BusinessReferenceArchitectureFileParser = require('../file-parsers/business-reference-architecture-file-parser');
const DMNFileParser = require('../file-parsers/dmn-file-parser');
const DrawIOFileParser = require('../file-parsers/drawio-file-parser');
const FeatureFileParser = require('../file-parsers/feature-file-parser');
const MarkdownFileParser = require('../file-parsers/markdown-file-parser');
const MarkdownMessageFileParser = require('../file-parsers/markdown-message-file-parser');
const MarkdownEmailFileParser = require('../file-parsers/markdown-email-file-parser');
const OpenapiFileParser = require('../file-parsers/openapi-file-parser');
const PumlFileParser = require('../file-parsers/puml-file-parser');
const SvgFileParser = require('../file-parsers/svg-file-parser');
const UseCaseFileParser = require('../file-parsers/use-case-file-parser');
const YmlFileParser = require('../file-parsers/yml-file-parser');

const BusinessModelCanvasComponent = require('../components/business-model-canvas-component');
const BusinessReferenceArchitectureComponent = require('../components/business-reference-architecture-component');
const CommandUseCaseComponent = require('../components/command-use-case-component');
const DMNComponent = require('../components/dmn-component');
const EmailComponent = require('../components/email-component');
const EventUseCaseComponent = require('../components/event-use-case-component');
const DashboardComponent = require('../components/dashboard-component');
const FeatureComponent = require('../components/feature-component');
const FullscreenComponent = require('../components/fullscreen-component');
const IFrameComponent = require('../components/iframe-component');
const ImageComponent = require('../components/image-component');
const MessageComponent = require('../components/message-component');
const ModelComponent = require('../components/model-component');
const OpenapiComponent = require('../components/openapi-component');
const PageComponent = require('../components/page-component');
const QueryUseCaseComponent = require('../components/query-use-case-component');
const TabsComponent = require('../components/tabs-component');
const TaskUseCaseComponent = require('../components/task-use-case-component');
const UserTaskComponent = require('../components/user-task-component');

const AnchorHtmlParser = require('../html-parsers/anchor-html-parser');
const CleanUpHtmlParser = require('../html-parsers/clean-up-html-parser');
const DefinitionHtmlParser = require('../html-parsers/definition-html-parser');
const ImageHtmlParser = require('../html-parsers/image-html-parser');
const ImageSVGHtmlParser = require('../html-parsers/image-svg-html-parser');
const RelativeUrlHtmlParser = require('../html-parsers/relative-url-html-parser');
const RemoveH1HtmlParser = require('../html-parsers/remove-h1-html-parser');
const FullscreenHtmlParser = require('../html-parsers/fullscreen-html-parser');
const HeadingHtmlParser = require('../html-parsers/heading-html-parser');
const UnsortedListHtmlParser = require('../html-parsers/unsorted-list-html-parser');

const BusinessModelCanvasAnchorParser = require('../anchor-parsers/business-model-canvas-anchor-parser');
const BusinessReferenceArchitectureAnchorParser = require('../anchor-parsers/business-reference-architecture-anchor-parser');
const CommandUseCaseAnchorParser = require('../anchor-parsers/command-use-case-anchor-parser');
const CodeAnchorParser = require('../anchor-parsers/code-anchor-parser');
const DashboardAnchorParser = require('../anchor-parsers/dashboard-anchor-parser');
const DMNAnchorParser = require('../anchor-parsers/dmn-anchor-parser');
const EventUseCaseAnchorParser = require('../anchor-parsers/event-use-case-anchor-parser');
const FeatureAnchorParser = require('../anchor-parsers/feature-anchor-parser');
const FeaturesAnchorParser = require('../anchor-parsers/features-anchor-parser');
const IFrameAnchorParser = require('../anchor-parsers/iframe-anchor-parser');
const ImageAnchorParser = require('../anchor-parsers/image-anchor-parser');
const MarkdownAnchorParser = require('../anchor-parsers/markdown-anchor-parser');
const ModelAnchorParser = require('../anchor-parsers/model-anchor-parser');
const QueryUseCaseAnchorParser = require('../anchor-parsers/query-use-case-anchor-parser');
const SvgAnchorParser = require('../anchor-parsers/svg-anchor-parser');
const TaskUseCaseAnchorParser = require('../anchor-parsers/task-use-case-anchor-parser');
const UrlRewriteAnchorParser = require('../anchor-parsers/url-rewrite-anchor-parser');
const UserTaskAnchorParser = require('../anchor-parsers/user-task-anchor-parser');

const logger = createLogger();

module.exports = class App {
    #options = null;

    constructor(options) {
        this.#options = options;
        this.container = awilix.createContainer({
            injectionMode: awilix.InjectionMode.PROXY
        });
    }

    async run() {
        if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'debug') {
            disbableLog();
        }

        await this.#init(this.#options);

        const options = this.container.resolve('options');
        const gitInfo = this.container.resolve('gitInfo');

        if (options.args.branches) {
            console.info();
            console.info(colors.brightGreen('ready, shutting down.....'));
            return;
        }
        
        console.info(colors.green('\ncreating index.html'));
        await fs.writeFile(path.resolve(options.basePath, 'index.html'), `<!DOCTYPE html>
        <html> 
            <head>
                <meta http-equiv="Refresh" content="0; URL=./${gitInfo.branches.find(b => b.mainBranch).path}index.html" />
            </head>
        </html>`);

        const hosting = this.container.resolve('hosting');
        await hosting.apply();

        await this.#parse(options);
        
        console.info(colors.green('\nrenaming directories:'));
        await this.#rename(options.dst);
        
        if(options.args.release) {
            console.info(colors.green('\ncreating release:'));
            await this.#release(options);
        }

        console.info(colors.brightGreen('\nready, shutting down.....'));
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
        options.release = path.resolve(options.release, gitInfo.branch.path);

        await createDestination(options);
        await createRelease(options);
        await createBranches(opts, gitInfo);
        await copyFiles(await this._getFileTransfers(options), options);

        registerServices(this.container, this._getServices(options));

        // Init stores
        console.info();
        console.info(colors.brightGreen('Initializing stores....'));

        await this.container.resolve('definitionStore').init();
        await this.container.resolve('locale').init();        
        await this.container.resolve('sitemap').init();

        this.#options = null;
    }

    async #parse(options) {
        await parseYmlFiles.bind(this)();
        await parseFiles.bind(this)();
        await parseUml.bind(this)();
        await parseMarkdown.bind(this)();

        async function parseYmlFiles() {
            const totalFiles = await files.count(options.dst);
            let current = 0;
            process.stdout.write("\nparsing yml files:\n");

            await files.each(options.dst, async (file) => {
                current += 1;

                try {
                    const markdownFileParser = this.container.resolve('ymlFileParser');

                    const dir = process.cwd();

                    //Set current working directory to file path
                    process.chdir(path.dirname(file));

                    await markdownFileParser.parse(file);

                    //Reset current working directory
                    process.chdir(dir);
                }
                catch (error) {
                    await this.#onError(file, error);

                    if (process.env.NODE_ENV === 'development') {
                        throw (error);
                    }
                }

                logger.progress(totalFiles, current);
            });
        }

        async function parseMarkdown() {
            const totalFiles = await files.count(options.dst);
            let current = 0;
            process.stdout.write("\nparsing mardkdown files:\n");

            await files.each(options.dst, async (file) => {
                current += 1;

                try {
                    const markdownFileParser = this.container.resolve('markdownFileParser');

                    const dir = process.cwd();

                    //Set current working directory to file path
                    process.chdir(path.dirname(file));

                    await markdownFileParser.parse(file);

                    //Reset current working directory
                    process.chdir(dir);
                }
                catch (error) {
                    await this.#onError(file, error);

                    if (process.env.NODE_ENV === 'development') {
                        throw (error);
                    }
                }

                logger.progress(totalFiles, current);
            });
        }

        async function parseFiles() {
            const fileParser = this.container.resolve('fileParser');
            const totalFiles = await files.count(options.dst);
            let current = 0;
            
            process.stdout.write("\nparsing files:\n");

            await files.each(options.dst, async (file) => {
                current += 1;

                try {
                    console.info();
                    console.info(colors.yellow(`parsing ${path.relative(options.dst, file)}`));

                    const dir = process.cwd();

                    //Set current working directory to file path
                    process.chdir(path.dirname(file));

                    await fileParser.parse(file);

                    //Reset current working directory
                    process.chdir(dir);
                }
                catch (error) {
                    await this.#onError(file, error);

                    if (process.env.NODE_ENV === 'development') {
                        throw (error);
                    }
                }

                logger.progress(totalFiles, current);
            });
            return { totalFiles, current };
        }

        async function parseUml() {
            console.info();
            console.info(colors.yellow(`parsing uml files`));

            process.stdout.write("\nparsing puml files:\n");

            const cmd = "java", args = [
                "-jar",
                `${__dirname}/../plantuml-1.2023.13.jar`,
                `${options.dst}/**.puml`,
                "-tsvg",
                "-enablestats",
                "-realtimestats",
                "-progress"
            ];

            const promise = execFile(cmd, args);
            let current = 0;

            promise.child.stdout.on('data', function (data) {
                current = (data.match(/#/g) || []).length;
                logger.progress(30, current);
                process.stdout.write(data);
            });

            promise.child.stderr.on('data', function (data) {
                process.stdout.write(data);
            });

            await promise;
            if (current < 30) {
                logger.progress(30, 30);
            }

            console.info(colors.green(`uml files parsed`));
        }
    }
    

    async #rename(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (let entry of entries) {
            if (entry.isDirectory()) {
                const src = path.resolve(dir, entry.name);
                const dst = path.resolve(dir, entry.name.replace(/(\d+[_])/ig, ''));
                
                if (src != dst) {
                    console.info(colors.green(`\trenaming ${path.relative(dir, src)} => ${path.relative(dir, dst)}`));
                    await fs.rename(src, dst);
                }
                await this.#rename(dst);
            }
        }
    }

    async #release(options, dir) {
        const contracts = ['.bpmn', '.release.feature', '.openapi.yml', '.openapi.yml.json'];
        dir = dir || options.dst;
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (let entry of entries) {
            const src = path.resolve(dir, entry.name);

            if (entry.isDirectory()) {
                await this.#release(options, src);
            }

            if(!contracts.some(c => src.endsWith(c)))
                continue;
                
            console.info(colors.yellow(`\t* releasing ${path.relative(options.dst, src)}`));
            
            const dst = src.replace(options.dst, options.release)
                .replace( '.release.feature',  '.feature');

            await files.copy(src, dst);
        }
    }
    
    async #onError(file, error) {
        const options = this.container.resolve('options');
        const markdownFileParser =  this.container.resolve('markdownFileParser');
        const gitInfo = this.container.resolve('gitInfo');

        process.chdir(options.dst);
       
        const errorFile = path.join(options.dst, 'index.md');
        const relativeFile = path.relative(options.dst, file);

        console.error(`Error in file ${file}.`);
        
        process.stdout.write("\n");
        process.stderr.write(colors.red(`There was an error while processing ${relativeFile}:`));
        process.stdout.write("\n");
        process.stdout.write(colors.red(error.message));

        const gitFile =  mustache.render(options.git.urlTemplate, { repository: gitInfo.branch.repository, branch: gitInfo.branch.name, file: relativeFile });
            
        const content = `# Error
    
There was an error while processing [${relativeFile}](${gitFile}).

Please review the error and fix the problem. A new version will be automaticly build when you commit a fix.

<pre class="error">
    ${error.stack}
</pre>`
    
        await fs.writeFile(errorFile, content);
    
        await markdownFileParser.parse(errorFile);
    }

    //Protected
    async _getFileTransfers(options) {
        const fileTransfers = [
            { src: options.assets, dst: path.resolve(options.basePath, 'assets') },
            { src: path.resolve(options.src, "assets"), dst: path.resolve(options.basePath, 'assets') },
            
            { src: path.resolve(options.nodeModules, 'swagger-ui-dist/favicon-16x16.png'), dst: path.resolve(options.basePath, 'assets/swagger-ui-dist') },
            { src: path.resolve(options.nodeModules, 'swagger-ui-dist/favicon-32x32.png'), dst: path.resolve(options.basePath, 'assets/swagger-ui-dist') },
            { src: path.resolve(options.nodeModules, 'swagger-ui-dist/swagger-ui.css'), dst: path.resolve(options.basePath, 'assets/swagger-ui-dist') },
            { src: path.resolve(options.nodeModules, 'swagger-ui-dist/swagger-ui.css.map'), dst: path.resolve(options.basePath, 'assets/swagger-ui-dist') },
            { src: path.resolve(options.nodeModules, 'swagger-ui-dist/swagger-ui-bundle.js'), dst: path.resolve(options.basePath, 'assets/swagger-ui-dist') },
            { src: path.resolve(options.nodeModules, 'swagger-ui-dist/swagger-ui-bundle.js.map'), dst: path.resolve(options.basePath, 'assets/swagger-ui-dist') },
            { src: path.resolve(options.nodeModules, 'swagger-ui-dist/swagger-ui-standalone-preset.js'), dst: path.resolve(options.basePath, 'assets/swagger-ui-dist') },
            { src: path.resolve(options.nodeModules, 'swagger-ui-dist/swagger-ui-standalone-preset.js.map'), dst: path.resolve(options.basePath, 'assets/swagger-ui-dist') },

            { src: path.resolve(options.nodeModules, 'svg-pan-zoom/dist/svg-pan-zoom.min.js'), dst: path.resolve(options.basePath, 'assets/svg-pan-zoom-dist') },

            { src: path.resolve(options.nodeModules, 'prismjs/components'), dst: path.resolve(options.basePath, 'assets/prismjs/components') },
            { src: path.resolve(options.nodeModules, 'prismjs/plugins/autoloader/prism-autoloader.min.js'), dst: path.resolve(options.basePath, 'assets/prismjs') },
            { src: path.resolve(options.nodeModules, 'prismjs/plugins/line-numbers/prism-line-numbers.min.js'), dst: path.resolve(options.basePath, 'assets/prismjs') },
            { src: path.resolve(options.nodeModules, 'prismjs/plugins/line-numbers/prism-line-numbers.min.css'), dst: path.resolve(options.basePath, 'assets/prismjs') },
            { src: path.resolve(options.nodeModules, 'prismjs/themes/prism-coy.min.css'), dst: path.resolve(options.basePath, 'assets/prismjs') },
            
            { src: path.resolve(options.nodeModules, 'iframe-resizer/js'), dst: path.resolve(options.basePath, 'assets/iframe-resizer-dist') },

            { src: path.resolve(options.nodeModules, '@biz-dev-ops/web-components/dist/web-components.js'), dst: path.resolve(options.basePath, 'assets/web-components') },
            { src: (await glob(path.resolve(options.nodeModules, '@biz-dev-ops/web-components/dist/*.woff2').replace(/\\/g, "/")))[0], dst: path.resolve(options.basePath, 'assets/web-components') },
            
            { src: path.resolve(options.nodeModules, 'pagedjs/dist'), dst: path.resolve(options.basePath, 'assets/pagedjs') },

            { src: options.src, dst: options.dst }
        ];

        if (options.theme) {
            fileTransfers.push({ src: options.theme, dst: path.resolve(options.basePath, 'assets/style/custom-theme.css') });
        }

        return fileTransfers;
    }

    //Protected
    _getServices(options) {
        return {
            'options': asValue(options),

            //Utils
            'headlessBrowser': asClass(HeadlessBrowser).singleton(),
            'testExecutionParser': asClass(TestExecutionParser).singleton(),
            'compositeFeatureParser': asClass(CompositeFeatureParser).singleton(),
            'cucumberTestExecutionParser': asClass(CucumberTestExecutionParser).singleton(),
            'specflowTestExecutionParser': asClass(SpecflowTestExecutionParser).singleton(),
            'testExecutionParsers': [
                'cucumberTestExecutionParser',
                'specflowTestExecutionParser'
            ],
            'testExecutionStore': asClass(TestExecutionStore).singleton(),
            'userTaskParser':  asClass(UserTaskParser).singleton(),
            'menu': asClass(Menu).singleton(),
            'pageUtil': asClass(PageUtil).singleton(),
            'sitemap': asClass(Sitemap).singleton(),
            'markdownRenderer': asClass(MarkdownRenderer).singleton(),
            'locale': asClass(Locale).singleton(),
            'progress': asValue(logger.progress),

            //BDD
            'gherkinParser': asClass(GherkinParser).singleton(),

            //Hosting services
            'hosting': asClass(CompositeHostingService).singleton(),
            'azureStaticWebApp': asClass(AzureStaticWebApp).singleton(),

            //Definitions
            'definitionParser': asClass(DefinitionParser).singleton(),
            'definitionStore': asClass(DefinitionStore).singleton(),

            //File parser
            'fileParser': asClass(CompositeFileParser).singleton(),
            'bpmnFileParser': asClass(BPMNFileParser).singleton(),
            'dmnFileParser': asClass(DMNFileParser).singleton(),
            'businessReferenceArchitectureFileParser': asClass(BusinessReferenceArchitectureFileParser).singleton(),
            'drawIOFileParser': asClass(DrawIOFileParser).singleton(),
            'featureFileParser': asClass(FeatureFileParser).singleton(),
            'markdownFileParser': asClass(MarkdownFileParser).singleton(),
            'markdownEmailFileParser': asClass(MarkdownEmailFileParser).singleton(),
            'markdownMessageFileParser': asClass(MarkdownMessageFileParser).singleton(),
            'openapiFileParser': asClass(OpenapiFileParser).singleton(),
            'pumlFileParser': asClass(PumlFileParser).singleton(),
            'svgFileParser': asClass(SvgFileParser).singleton(),
            'useCaseFileParser': asClass(UseCaseFileParser).singleton(),
            'ymlFileParser': asClass(YmlFileParser).singleton(),

            //HTML parser
            'anchorHtmlParser': asClass(AnchorHtmlParser).singleton(),
            'cleanUpHtmlParser': asClass(CleanUpHtmlParser).singleton(),
            'definitionHtmlParser': asClass(DefinitionHtmlParser).singleton(),
            'fullscreenHtmlParser': asClass(FullscreenHtmlParser).singleton(),
            'headingHtmlParser': asClass(HeadingHtmlParser).singleton(),
            'imageHtmlParser': asClass(ImageHtmlParser).singleton(),
            'imageSVGHtmlParser': asClass(ImageSVGHtmlParser).singleton(),
            'relativeUrlHtmlParser': asClass(RelativeUrlHtmlParser).singleton(),
            'removeH1HtmlParser': asClass(RemoveH1HtmlParser).singleton(),
            'unsortedListHtmlParser': asClass(UnsortedListHtmlParser).singleton(),

            //Anchor parser
            'businessModelCanvasAnchorParser': asClass(BusinessModelCanvasAnchorParser).singleton(),
            'businessReferenceArchitectureAnchorParser': asClass(BusinessReferenceArchitectureAnchorParser).singleton(),
            'codeAnchorParser': asClass(CodeAnchorParser).singleton(),
            'commandUseCaseAnchorParser': asClass(CommandUseCaseAnchorParser).singleton(),
            'dashboardAnchorParser': asClass(DashboardAnchorParser).singleton(),
            'dmnAnchorParser': asClass(DMNAnchorParser).singleton(),
            'eventUseCaseAnchorParser': asClass(EventUseCaseAnchorParser).singleton(),
            'featureAnchorParser': asClass(FeatureAnchorParser).singleton(),
            'featuresAnchorParser': asClass(FeaturesAnchorParser).singleton(),
            'imageAnchorParser': asClass(ImageAnchorParser).singleton(),
            'iframeAnchorParser': asClass(IFrameAnchorParser).singleton(),
            'markdownAnchorParser': asClass(MarkdownAnchorParser).singleton(),
            'modelAnchorParser': asClass(ModelAnchorParser).singleton(),
            'queryUseCaseAnchorParser': asClass(QueryUseCaseAnchorParser).singleton(),
            'svgAnchorParser': asClass(SvgAnchorParser).singleton(),
            'taskUseCaseAnchorParser': asClass(TaskUseCaseAnchorParser).singleton(),
            'urlRewriteAnchorParser': asClass(UrlRewriteAnchorParser).singleton(),
            'userTaskAnchorParser': asClass(UserTaskAnchorParser).singleton(),

            //Component
            'businessModelCanvasComponent': asClass(BusinessModelCanvasComponent).singleton().inject(container => allowUnregistered(container, 'businessModelCanvasComponentRenderFn')),
            'businessReferenceArchitectureComponent': asClass(BusinessReferenceArchitectureComponent).singleton().inject(container => allowUnregistered(container, 'businessReferenceArchitectureComponentRenderFn')),
            'commandUseCaseComponent': asClass(CommandUseCaseComponent).singleton().inject(container => allowUnregistered(container, 'commandUseCaseComponentRenderFn')),
            'dashboardComponent': asClass(DashboardComponent).singleton().inject(container => allowUnregistered(container, 'dashboardComponentRenderFn')),
            'dmnComponent': asClass(DMNComponent).singleton().inject(container => allowUnregistered(container, 'dmnComponentRenderFn')),
            'emailComponent': asClass(EmailComponent).singleton().inject(container => allowUnregistered(container, 'emailComponentRenderFn')),
            'eventUseCaseComponent': asClass(EventUseCaseComponent).singleton().inject(container => allowUnregistered(container, 'eventUseCaseComponentRenderFn')),
            'featureComponent': asClass(FeatureComponent).singleton().inject(container => allowUnregistered(container, 'featureComponentRenderFn')),
            'fullscreenComponent': asClass(FullscreenComponent).singleton().inject(container => allowUnregistered(container, 'fullscreenComponentRenderFn')),
            'iFrameComponent': asClass(IFrameComponent).singleton().inject(container => allowUnregistered(container, 'iFrameComponentRenderFn')),
            'imageComponent': asClass(ImageComponent).singleton().inject(container => allowUnregistered(container, 'imageComponentRenderFn')),
            'messageComponent': asClass(MessageComponent).singleton().inject(container => allowUnregistered(container, 'messageComponentRenderFn')),
            'modelComponent': asClass(ModelComponent).singleton().inject(container => allowUnregistered(container, 'modelComponentRenderFn')),
            'openapiComponent': asClass(OpenapiComponent).singleton().inject(container => allowUnregistered(container, 'openapiComponentRenderFn')),
            'pageComponent': asClass(PageComponent).singleton().inject(container => allowUnregistered(container, 'pageComponentRenderFn')),
            'queryUseCaseComponent': asClass(QueryUseCaseComponent).singleton().inject(container => allowUnregistered(container, 'queryUseCaseComponentRenderFn')),
            'tabsComponent': asClass(TabsComponent).singleton().inject(container => allowUnregistered(container, 'tabsComponentRenderFn')),
            'taskUseCaseComponent': asClass(TaskUseCaseComponent).singleton().inject(container => allowUnregistered(container, 'taskUseCaseComponentRenderFn')),
            'userTaskComponent': asClass(UserTaskComponent).singleton().inject(container => allowUnregistered(container, 'userTaskComponentRenderFn')),
            
            'hostingServices': [
                'azureStaticWebApp'
            ],

            'preFileParsers': [
                'ymlFileParser'
            ],

            //File parsers: order can be important!
            'fileParsers': [
                'bpmnFileParser',
                'businessReferenceArchitectureFileParser',
                'dmnFileParser',
                'featureFileParser',
                'drawIOFileParser',
                'markdownEmailFileParser',
                'markdownMessageFileParser',
                'openapiFileParser',
                'pumlFileParser',
                'svgFileParser',
                'useCaseFileParser'
            ],

            'postFileParsers': [
                'markdownFileParser'
            ],

            //Html parsers, order is important!
            'htmlParsers': [
                'removeH1HtmlParser',
                'imageSVGHtmlParser',
                'headingHtmlParser',
                'anchorHtmlParser',
                'unsortedListHtmlParser',
                'imageHtmlParser',
                'fullscreenHtmlParser',
                'definitionHtmlParser',
                'cleanUpHtmlParser',
                'relativeUrlHtmlParser'
            ],

            //Anchor parsers, order can be important!
            'anchorParsers': [
                'urlRewriteAnchorParser',
                'businessModelCanvasAnchorParser',
                'businessReferenceArchitectureAnchorParser',
                'codeAnchorParser',
                // 'dmnAnchorParser',
                'featureAnchorParser',
                'featuresAnchorParser',
                'dashboardAnchorParser',
                'markdownAnchorParser',
                'iframeAnchorParser',
                'userTaskAnchorParser',
                'imageAnchorParser',
                'svgAnchorParser',
                'modelAnchorParser',
                'commandUseCaseAnchorParser',
                'eventUseCaseAnchorParser',
                'queryUseCaseAnchorParser',
                'taskUseCaseAnchorParser'
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
    console.info(colors.yellow(`reading from source ${options.src}`));
    console.info(colors.yellow(`writing to destination: ${options.dst}`));

    await fs.rm(path.resolve(options.basePath, "assets"), { recursive: true, force: true });
    await fs.rm(options.dst, { recursive: true, force: true });
    await fs.mkdir(options.dst, { recursive: true });
}

async function createRelease(options) {
    await fs.rm(options.release, { recursive: true, force: true });
    if(options.args.release)
        await fs.mkdir(options.release, { recursive: true });
}

async function createBranches(options, gitInfo) {
    console.info();
    console.info(colors.yellow(`creating branches.json`));
    await fs.writeFile(`${options.dst}/branches.json`, JSON.stringify(gitInfo.branches));
    await fs.writeFile(`${options.dst}/branches.js`, `window.x_md_docs_cli_branches = ${JSON.stringify(gitInfo.branches)};`);
}

async function copyFiles(fileTransfers, options) {
    console.info();
    console.info(colors.yellow(`copying files:`));
    for (const fileTransfer of fileTransfers) {
        console.info(colors.yellow(`\t* copying files from ${fileTransfer.src} to ${path.relative(process.cwd(), fileTransfer.dst)}`));
        await files.copy(fileTransfer.src, fileTransfer.dst);
    }
    await fs.rm(path.resolve(options.dst, "assets"), { recursive: true, force: true });
}

function registerServices(container, services) {
    console.info();
    console.info(colors.yellow(`registering services:`));
    const parsed = {};

    for (const [key, value] of Object.entries(services)) {
        console.info(colors.yellow(`\t* registering service ${key}`));
        parsed[key] = parseResolver(value);
    }

    container.register(parsed);
}

function parseResolver(resolver) {
    if (Array.isArray(resolver))
        return asArray(resolver);    
    
    if (!resolver.disposer)
        return resolver;
    
    return resolver.disposer?.(async service => await service.dispose?.());
}

function createLogger() {
    const logger = {

        progress: function(total, current) {
            const size = 50;

            if(current > total) {
                current = total;
            }

            const one = (size / total);
            const done = Math.round(one * current);
            const dots = ".".repeat(done);
            const empty = " ".repeat((size - done));
            const percentage = Math.floor((current / total) * 100);

            process.stdout.write(`\r[${dots}${empty}] ${percentage}%`)

            if(total === current) {
                process.stdout.write("\n");
            }
        }
    };
    const methods = ["log", "debug", "info", "warn", "error"];
    for(let i=0;i<methods.length;i++){
        logger[methods[i]] = console[methods[i]];
    }

    return logger;
}

function disbableLog() {
    const methods = ["log", "debug", "info"];
    for(let i=0;i<methods.length;i++){
        console[methods[i]] = function(){};
    }

    process.stdout.write("\nLogging is disabled. To enable logging set NODE_ENV to development or debug: export NODE_ENV=debug\n\n");
}