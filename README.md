[![test](https://github.com/synionnl/md-docs-cli/actions/workflows/test.yml/badge.svg)](https://github.com/synionnl/md-docs-cli/actions/workflows/test.yml)
[![audit](https://github.com/synionnl/md-docs-cli/actions/workflows/test.yml/badge.svg)](https://github.com/synionnl/md-docs-cli/actions/workflows/audit.yml)
[![npm](https://img.shields.io/npm/v/@synion/md-docs.svg)](https://npmjs.org/package/@synion/md-docs)
[![npm](https://img.shields.io/npm/dm/@synion/md-docs.svg)](https://npmjs.org/package/@synion/md-docs)

# Living documentation

See [product documentation](https://docs.synion.nl/products/md-docs-cli/index.html) for more information.

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

```
md-docs -t theme.css
```

### Skip branches

```
md-docs -s branch
```

## To debug

Set the environment to development. All intermediate steps are saved as files in the dist directory.

```
export NODE_ENV=development
```



