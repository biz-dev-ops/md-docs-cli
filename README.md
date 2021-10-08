# Living documentation

This script copies every file and directory from the **docs** directory into the **dist** directory. After copying it transforms every `*.md` file into a html file while adding the following features:

1. Menu, every index.md is added to the menu;
1. Every heading is automaticly converted into a container;
1. Every `*.bpmn` anchor is automaticly [converted](https://bpmn.io/toolkit/bpmn-js/) into a bpmn.io viewer;
1. Every `*openapi.yaml` anchor is automaticly [converted](https://github.com/OpenAPITools/openapi-generator) into a html documentation site;
1. Every `*asyncapi.yaml` anchor is automaticly [converted](https://github.com/asyncapi/generator) into a html documentation site;
1. Every `*.feature` anchor is automaticly converted into a code block;
1. Evenry `*form.yaml` is automaticly [converted](https://www.npmjs.com/package/jsonform) into a html form;
1. Every markdown anchor is automaticly converted into an html link;
1. Images are wrapped in figures;
1. Images can be alligned by adding align=center or align=left or align=right to the url;
1. Markdown is transformed into html using [markdow-it](), the following plugins are installed:
    * [markdown-it-multimd-table](https://www.npmjs.com/package/markdown-it-multimd-table) => additional table options;
    * [markdown-it-toc-done-right](https://www.npmjs.com/package/markdown-it-toc-done-right) => table of contents for h1, h2 and h3;
    * [markdown-it-container](https://www.npmjs.com/package/markdown-it-container) => info, warning and error containers;
    * [markdown-it-plantuml-ex](https://www.npmjs.com/package/markdown-it-plantuml-ex) => UML is automaticly converted into a SVG;
    * [markdown-it-abbr](https://www.npmjs.com/package/markdown-it-abbr);
    * [markdown-it-codetabs](https://www.npmjs.com/package/markdown-it-codetabs);


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


