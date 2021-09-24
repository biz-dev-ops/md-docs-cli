# Living documentation

This script copies every file and directory from the **docs** directory into the **dist** directory. After copying it transforms every `*.md` file into a html file while adding the following features:

1. Menu, every index.md is added to the menu;
1. Table of contents for h1, h2 and h3;
1. info, warning and error containers;
1. UML is automaticly converted into SVG;
1. Every heading is automaticly converted into a container;
1. Every `*.bpmn` anchor is automaticly converted into a bpmn.io viewer;
1. Every `*openapi.yaml` anchor is automaticly converted into a html documentation site;
1. Every `*asyncapi.yaml` anchor is automaticly converted into a html documentation site;
1. Every `*.feature` anchor is automaticly converted into a code block;
1. Every markdown anchor is automaticly converted into an html link;
1. Images are wrapped in figures;
1. Images can be alligned by adding align=center or align=left or align=right to the url;

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


