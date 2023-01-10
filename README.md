<!-- [![test](https://github.com/synionnl/md-docs-cli/actions/workflows/test.yml/badge.svg)](https://github.com/synionnl/md-docs-cli/actions/workflows/test.yml)
[![audit](https://github.com/synionnl/md-docs-cli/actions/workflows/audit.yml/badge.svg)](https://github.com/synionnl/md-docs-cli/actions/workflows/audit.yml) -->
[![analyze](https://github.com/synionnl/md-docs-cli/actions/workflows/analyze.yml/badge.svg)](https://github.com/synionnl/md-docs-cli/actions/workflows/analyze.yml)
[![release](https://github.com/synionnl/md-docs-cli/actions/workflows/release.yml/badge.svg)](https://github.com/synionnl/md-docs-cli/actions/workflows/release.yml)
[![npm](https://img.shields.io/npm/v/@synion/md-docs.svg)](https://npmjs.org/package/@synion/md-docs)
[![npm](https://img.shields.io/npm/dm/@synion/md-docs.svg)](https://npmjs.org/package/@synion/md-docs)
[![alerts](https://img.shields.io/lgtm/alerts/g/synionnl/md-docs-cli.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/synionnl/md-docs-cli/alerts/)

## Product

md-docs is a cli tool which generates a static website by resolving files recursivly from a source folder.

See the [test set](https://github.com/synionnl/md-docs-cli/tree/main/tests) for more information.

This script copies every file and directory from the **docs** directory into the **dist** directory and transforms every `*.md` file into a html file while adding the following features:

1. Every *.md is transformed in a static web page;
1. Every *.email.md is transformed in a static document web page;
1. Every *.message.md is transformed in a static document web page and PDF;
1. Every index.md is added to the menu;
1. Every heading is automaticly converted into a container;
1. Every `*.bpmn` anchor is automaticly [converted](https://bpmn.io/toolkit/bpmn-js/) into a bpmn.io viewer;fir
1. Every `*openapi.yaml` anchor is automaticly [converted](https://github.com/OpenAPITools/openapi-generator) into a html documentation page;
1. Every `*asyncapi.yaml` anchor is automaticly [converted](https://github.com/asyncapi/generator) into a html documentation page;
1. Every `*.feature` anchor is automaticly converted into a feature details list;
1. Every `*.dashboard.yaml` anchor is automaticly converted into a BDD dashboard;
1. Every `*.user-task.yaml` anchor is automaticly converted into a user-interface;
1. Every `*.puml` filer is automaticly [converted](https://plantuml.com/) into an svg image file;
1. Every `*.drawio` file is automaticly into an svg image file;
1. Every `*.java`, `*.cs`, `*.ts`, `*.js`, `*.json`, `*.py`, `*.yml`, `*.yml` anchor is automaticly converted in a code block; 
1. Every markdown anchor is automaticly converted into an html link;
1. Every markdown anchor which starts with an `_` is automaticly added to the markdown file; 
1. Every git branch is added to the git menu;
1. Test executions are automaticly parsed in feature files;
1. Unsorted list with items which reference the files above are automaticly converted in tab panels;
1. Images are wrapped in figures;
1. Images can be alligned by adding align=center or align=left or align=right to the url;
1. Markdown is transformed into html using [markdow-it](https://www.npmjs.com/package/markdown-it), the following plugins are installed:
    * [markdown-it-multimd-table](https://www.npmjs.com/package/markdown-it-multimd-table) => additional table options;
    * [markdown-it-container](https://www.npmjs.com/package/markdown-it-container) => info, warning and error containers;
    * [markdown-it-plantuml-ex](https://www.npmjs.com/package/markdown-it-plantuml-ex) => UML is automaticly converted into a SVG;
    * [markdown-it-abbr](https://www.npmjs.com/package/markdown-it-abbr);
    * [markdown-it-codetabs](https://www.npmjs.com/package/markdown-it-codetabs);
    * [markdown-it-attrs](https://www.npmjs.com/package/markdown-it-attrs);

All links are relative so you do not need a webserver.

![Class diagram](https://raw.githubusercontent.com/synionnl/md-docs-cli/main/class-diagram.puml.svg)

## Architecture

The application is written in node js and implements a plug in architecture. It uses [Awilix](https://github.com/jeffijoe/awilix/) under the hood for dependency resolving. Plugins can be used by extending App and adding or replacing service registrations.

There are several plugin strategies:

1. add or change the file parsers;
1. add or change the html parsers;
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
npm install @synion/md-docs -g
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
