#! /usr/bin/env node

const util = require('util');
const chalk = require('chalk-next');
const yargs = require('yargs');
const figlet = util.promisify(require('figlet'));
const path = require('path');
const { cwd } = require('process');

const App = require('./app');

async function run(options) {
    const logo = await figlet('md-docs-cli');
    console.info(chalk.blueBright(logo));

    options.src = path.resolve(cwd(), `docs`)
    options.dst = path.resolve(cwd(), `dist`);
    options.testExecutionLocation = path.resolve(cwd(), `.temp/executions`);

    const app = new App(options);    
    await app.run();
    app.dispose();
}

const options = yargs
    .usage("Usage: -b")
    .option("b", { alias: "branches", describe: "Output banches only", type: "boolean", demandOption: false })
    .option("t", { alias: "theme", describe: "Path to a stylesheet to include in the source", type: "string", demandOption: false })
    .argv;

run(options);