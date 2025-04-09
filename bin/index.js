#! /usr/bin/env node

const yargs = require('yargs');
const figlet = require('figlet');
const colors = require('colors');
const path = require('path');
const yaml = require('js-yaml');
const { cwd } = require('process');
const packageJson = require('../package.json');

const files = require('./utils/files');
const App = require('./app');

const mdDocsVersion = require("../package.json").version;

async function run(o) {
    const logo = await figlet(`md-docs-cli`);
    console.info(logo);
    console.info(`version ${mdDocsVersion}`);

    const options = await createOptions(o);

    options.src = path.resolve(cwd(), `docs`);
    options.dst = path.resolve(cwd(), `dist`);
    options.release = path.resolve(cwd(), `release`);
    options.testExecutionLocation = path.resolve(cwd(), `.temp/executions`);
    options.assets = await find(__dirname, 'assets');
    options.nodeModules = await find(__dirname, 'node_modules');
    options.version = packageJson.version;

    const app = new App(options);
    await app.run();
    app.dispose();
}

async function find(src, folder, index = 0) {
    if (index == 5) {
        console.error(colors.brightRed(`\t* ${folder} directory not found.`));
        throw new Error(`${folder} directory not found.`);
    }

    const directory = path.resolve(src, folder);
    if (await files.exists(directory)) {
        return directory;
    }

    return await find(path.resolve(src, '..'), folder, index++);
}

const options = yargs
    .usage("Usage: -b")
    .option("b", { alias: "branches", describe: "Output banches only", type: "boolean", demandOption: false })
    .option("s", { alias: "skip", describe: "Branches to skip", array: true, type: "string", demandOption: false })
    .option("r", { alias: "release", describe: "Create release", type: "boolean", demandOption: false })
    .option("f", { alias: "failFast", describe: "Throws the error when it occurs which causes the application to quit and fail.", type: "boolean", demandOption: false })
    .argv;

async function createOptions(options) {
    var file = path.resolve(cwd(), `options.yml`);

    if (!await files.exists(file))
        file = path.resolve(cwd(), `docs/options.yml`);

    if (!await files.exists(file))
        return options;

    const content = await files.readFileAsString(file);
    const json = yaml.load(content);

    return {
        ...{ args: options },
        ...json
    };
}

run(options);