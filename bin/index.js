#! /usr/bin/env node

const util = require('util');
const yargs = require('yargs');
const figlet = util.promisify(require('figlet'));
const colors = require('colors');
const path = require('path');
const yaml = require('js-yaml');
const { cwd } = require('process');

const files = require('./utils/files');
const App = require('./app');

async function run(o) {
    const logo = await figlet('md-docs-cli');
    console.info(logo);

    const options = await createOptions(o);

    options.src = path.resolve(cwd(), `docs`);
    options.dst = path.resolve(cwd(), `dist`);
    options.testExecutionLocation = path.resolve(cwd(), `.temp/executions`);
    options.assets = await find(__dirname, 'assets');
    options.nodeModules = await find(__dirname, 'node_modules');

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
    .argv;

async function createOptions(options) {
    var file = path.resolve(cwd(), `options.yml`);
    if (!await files.exists(file))
        return options;
    
    const content = await files.readFileAsString(file);
    const json = yaml.load(content);
    
    return {
        ...options,
        ...json
    };
}


run(options);