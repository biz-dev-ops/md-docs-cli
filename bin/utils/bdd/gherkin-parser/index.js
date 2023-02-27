const fs = require('fs').promises;
const path = require('path');
const md5 = require('md5');
const { env, cwd } = require('process');

const { GherkinStreams } = require('@cucumber/gherkin-streams');

const grouper = require('../feature-group-parser');

module.exports = class GherkinParser {
    constructor({ options, testExecutionParser }) {
        this.options = options;
        this.testExecutionParser = testExecutionParser;
    }

    async parse(files) {
        const features = await this.#parseFeatures(files);
        await this.testExecutionParser.parse(features);
        return features;
    }


    async parseAndGroup(files) {
        const features = await this.parse(files);
        return grouper.group(features);
    }

    async #parseFeatures(files) {
        if (files == undefined)
            throw new Error(`files is not defined`);
    
        if (!Array.isArray(files))
            files = [files];
    
        const chunks = await this.#getChunks(files);
    
        if (env.NODE_ENV === 'development')
            await fs.writeFile(path.resolve(cwd(), 'chunks.json'), JSON.stringify(chunks));
    
        return chunks
            .filter(chunk => chunk.source)
            .map(chunk => ({ 
                uri: chunk.source.uri,
                hash: chunk.source.hash,
                group: chunk.source.group
            }))
            .map(ref => {
                const document = chunks.find(chunk => chunk.gherkinDocument?.uri === ref.uri);
                if (document == undefined)
                    throw new Error(`gherkinDocument with uri ${ref.uri} not found in chunks`);
    
                const feature = document.gherkinDocument.feature;
                if (feature == undefined)
                    throw new Error(`feature not found in gherkinDocument with uri ${ref.uri}`);
    
                const background = feature.children.find(child => child.background)?.background;
    
                return {
                    name: feature.name,
                    title: feature.name,
                    group: ref.group,
                    scenarios: feature.children
                        .filter(child => child.scenario)
                        .map(child => child.scenario)
                        .map(scenario => {
                            const pickles = chunks
                                .filter(chunk => chunk.pickle?.astNodeIds.includes(scenario.id))
                                .map(chunk => chunk.pickle);
    
                            const steps = (background?.steps ?? []).concat(scenario.steps);
    
                            if (pickles.length === 0)
                                throw new Error(`pickle not found for scenario with id ${scenario.id} in gherkinDocument with uri ${ref.uri}`);
    
                            if (pickles.length === 1) {
                                const pickle = pickles[0];
                                return {
                                    name: pickle.name,
                                    template: scenario.name,
                                    steps: steps.map((step, index) => mapStep(pickle, step, index))
                                }
                            }
                            else {
                                return {
                                    name: scenario.name,
                                    arguments: getArguments(scenario),
                                    scenarios: pickles
                                        .map((pickle, index) => ({
                                            name: pickle.name,
                                            template: scenario.name,
                                            steps: steps.map((step, index) => mapStep(pickle, step, index)),
                                            arguments: getArguments(scenario, index),
                                        }))
                                }
                            }
                        })
                };
            });
    }

    async #getChunks(files, group) {
        const chunks = [];
    
        for (const file of files) {
            if(typeof file === 'object')
                chunks.push(...await this.#getChunks(file.files, file.name));
            else
                chunks.push(... await this.#getFileChunks(file, group));
        }
    
        return chunks;
    }
    
    async #getFileChunks(file, group) {
        const dst = this.options.dst;
        return new Promise((resolve, reject) => {
            const stream = GherkinStreams.fromPaths([file])
            const chunks = [];
    
            stream.on("data", function (chunk) {
                if(chunk.source) {
                    chunk.source.hash = md5(path.relative(dst, file));
                    
                    if(group)
                        chunk.source.group = group;
                }
                chunks.push(chunk);
            });
    
            stream.on("end", function () {
                resolve(chunks);
            });
    
            stream.on('error', function (err) {
                reject(err);
            });
        });
    }
}

function mapStep(pickle, step, index) {
    const pickleStep = pickle.steps[index];
    if (pickleStep == undefined)
        throw new Error(`step ${index} not found in pickle with id ${pickle.id}`);

    return {
        id: step.id,
        type: step.keyword.trim().toLowerCase(),
        keyword: step.keyword.trim(),
        text: pickleStep.text,
        template: step.text,
        dataTable: getDataTable(pickleStep)
    };
}

function getDataTable(step) {
    const dataTable = step?.argument?.dataTable;
    if (dataTable == undefined)
        return null;

    return dataTable.rows.map(row => row.cells.map(c => c.value));
}

function getArguments(scenario, index) {
    const example = scenario.examples[0];
    if (example == undefined)
        return [];

    if (index == undefined) {
        if (example.tableHeader == undefined)
            return [];

        return example.tableHeader.cells.map(c => c.value);
    }
    else {
        if (example.tableBody == undefined)
            return [];

        return example.tableBody[index].cells.map(c => c.value);
    }
}