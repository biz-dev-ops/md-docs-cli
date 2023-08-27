<!-- [![test](https://github.com/synionnl/md-docs-cli/actions/workflows/test.yml/badge.svg)](https://github.com/synionnl/md-docs-cli/actions/workflows/test.yml)
[![audit](https://github.com/synionnl/md-docs-cli/actions/workflows/audit.yml/badge.svg)](https://github.com/synionnl/md-docs-cli/actions/workflows/audit.yml) -->
[![analyze](https://github.com/synionnl/md-docs-cli/actions/workflows/analyze.yml/badge.svg)](https://github.com/synionnl/md-docs-cli/actions/workflows/analyze.yml)
[![release](https://github.com/synionnl/md-docs-cli/actions/workflows/release.yml/badge.svg)](https://github.com/synionnl/md-docs-cli/actions/workflows/release.yml)
[![npm](https://img.shields.io/npm/v/@biz-dev-ops/md-docs.svg)](https://npmjs.org/package/@biz-dev-ops/md-docs)
[![npm](https://img.shields.io/npm/dm/@biz-dev-ops/md-docs.svg)](https://npmjs.org/package/@biz-dev-ops/md-docs)

## Product

md-docs is a cli tool which generates a static website by resolving files recursivly from a source folder.

See the [test set](https://github.com/synionnl/md-docs-cli/tree/main/tests) for more information.

This script copies every file and directory from the **docs** directory into the **dist** directory and transforms every `*.md` file into a html file while adding the following features:

1. Every *.md is transformed in a static web page;
2. Every *.email.md is transformed in a static document web page;
3. Every *.message.md is transformed in a static document web page and PDF;
4. Every index.md is added to the menu;
5. Every heading is automatically converted into a container;
6. Every `*.model.yml` anchor is automatically [converted](https://github.com/synionnl/model-viewer) into a model viewer;
7. Every `*.bpmn` anchor is automatically [converted](https://bpmn.io/toolkit/bpmn-js/) into a BPMN.io viewer;
8. Every `*openapi.yaml` anchor is automatically [converted](https://github.com/OpenAPITools/openapi-generator) into a HTML documentation page;
9.  Every `*asyncapi.yaml` anchor is automatically [converted](https://github.com/asyncapi/generator) into a HTML documentation page;
10. Every `*.feature` anchor is automatically converted into a feature details list;
11. Every `*.dashboard.yaml` anchor is automatically converted into a BDD dashboard;
12. Every `*.user-task.yaml` anchor is automatically converted into a user-interface;
13. Every `*.puml` filer is automatically [converted](https://plantuml.com/) into an SVG image file;
14. Every `*.drawio` file is automatically into an SVG image file;
15. Every `*.java`, `*.cs`, `*.ts`, `*.js`, `*.json`, `*.py`, `*.yml`, `*.yml` anchor is automatically converted in a code block; 
16. Every markdown anchor is automatically converted into an HTML link;
17. Every markdown anchor which starts with a `_` is automatically added to the markdown file; 
18. Every git branch is added to the git menu;
19. Test executions are automatically parsed in feature files;
20. Unsorted list with items which reference the files above are automatically converted in tab panels;
21. Images are wrapped in figures;
22. Images can be aligned by adding align=center or align=left or align=right to the URL;
23. Markdown is transformed into HTML using [markdow-it](https://www.npmjs.com/package/markdown-it), the following plugins are installed:
    * [markdown-it-multimd-table](https://www.npmjs.com/package/markdown-it-multimd-table) => additional table options;
    * [markdown-it-container](https://www.npmjs.com/package/markdown-it-container) => info, warning and error containers;
    * [markdown-it-plantuml-ex](https://www.npmjs.com/package/markdown-it-plantuml-ex) => UML is automatically converted into a SVG;
    * [markdown-it-abbr](https://www.npmjs.com/package/markdown-it-abbr);
    * [markdown-it-codetabs](https://www.npmjs.com/package/markdown-it-codetabs);
    * [markdown-it-attrs](https://www.npmjs.com/package/markdown-it-attrs);

All links are relative, so you do not need a web server.

![Class diagram](https://raw.githubusercontent.com/synionnl/md-docs-cli/main/class-diagram.puml.svg)

## Architecture

The application is written in node js and implements a plug in architecture. It uses [Awilix](https://github.com/jeffijoe/awilix/) under the hood for dependency resolving. Plugins can be used by extending App and adding or replacing service registrations.

There are several plugin strategies:

1. add or change the file parsers;
1. add or change the HTML parsers;
1. add or change the anchor parsers;
1. change components;
1. change component render functions;

```js
const App = require('md-docs-cli/app');

module.exports = class MyApp extends App {
  constructor(options) {
    super(options);
  }

  _getServices(options) {
    const services = super(options);

    //Option 1
    services['newFileParser'] = asClass(NewFileParser).singleton();
    services.fileParsers.push('newFileParser');

    //Option 2
    services['newHtmlParser'] = asClass(NewHtmlParser).singleton();
    services.htmlParsers.push('newHtmlParser');

    //Option 3
    services['newAnchorParser'] = asClass(NewAnchorParser).singleton();
    services.anchorParsers.push('newAnchorParser');

    //Option 4
    services.pageComponent = asClass(MyPageComponent).singleton();

    //Option 5
    services.pageComponentRenderFn = asValue((data) => '<html />');

    return services;
  }
}
```

## To get started

```
npm install @biz-dev-ops/md-docs -g
mkdir ../documentation
cd documentation
mkdir docs
echo "# It works!" > docs/index.md
md-docs
google-chrome dist/index.html
```

## Options

### branches only

```
md-docs -b
```

### Custom theme

You can override all assets files by adding the same files to docs folder:  docs/assets/style/custom-theme.css can then be overwritten by a custom theme implementation.

### Skip branches

```
md-docs -s branch1 branch2
```

## To debug

Set the environment to development. All intermediate steps are saved as files in the dist directory.

```
export NODE_ENV=development
```
