# Living documentation

See [product documentation](https://docs.synion.nl/products/md-docs-cli/index.html) for more information.

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

## Options

```
md-docs -b
```

```
md-docs -t theme.css
```

## To debug

Set the environment to development. All intermediate steps are saved as files in the dist directory.

```
export NODE_ENV=development
```



