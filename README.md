# Living documentation

This script copies every file and directory from the **docs** directory into the **dist** directory and transforms every `*.md` file into a html file while adding the following features:

1. Every index.md is transformed in a static web page;
1. Every index.md is added to the menu;
1. Every heading is automaticly converted into a container;
1. Every `*.bpmn` anchor is automaticly [converted](https://bpmn.io/toolkit/bpmn-js/) into a bpmn.io viewer;
1. Every `*openapi.yaml` anchor is automaticly [converted](https://github.com/OpenAPITools/openapi-generator) into a html documentation site;
1. Every `*asyncapi.yaml` anchor is automaticly [converted](https://github.com/asyncapi/generator) into a html documentation site;
1. Every `*.feature` anchor is automaticly converted into a code block;
1. Every `*.dashboard.yaml` anchor is automaticly converted into dashboard;
1. Every `*.user-task.yaml` is automaticly converted into an user-interface;
1. Every `*.puml` is automaticly [converted](https://plantuml.com/) into an svg;
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
    * [markdown-it-toc-done-right](https://www.npmjs.com/package/markdown-it-toc-done-right) => table of contents for h1, h2 and h3;    
    * [markdown-it-plantuml-ex](https://www.npmjs.com/package/markdown-it-plantuml-ex) => UML is automaticly converted into a SVG;
    * [markdown-it-abbr](https://www.npmjs.com/package/markdown-it-abbr);
    * [markdown-it-codetabs](https://www.npmjs.com/package/markdown-it-codetabs);
    * [markdown-it-attrs](https://www.npmjs.com/package/markdown-it-attrs);

All links are relative so you do not need a webserver.

## To get started

```
npm link
mkdir ../documentation
cd documentation
mkdir docs
echo "# It works!" > docs/index.md
md-docs
google-chrome dist/index.html
```


