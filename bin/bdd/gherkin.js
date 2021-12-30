const { GherkinStreams } = require('@cucumber/gherkin-streams');

exports.parse = async (files) => {
    if (files == undefined)
        throw `files is not defined`;

    if (!Array.isArray(files))
        files = [files];

    const chunks = await getChunks(files);

    return chunks
        .filter(chunk => chunk.source)
        .map(chunk => chunk.source.uri)
        .map(uri => {
            const document = chunks.find(chunk => chunk.gherkinDocument?.uri === uri);
            if (document == undefined)
                throw `gherkinDocument with uri ${uri} not found in chunks`;

            const feature = document.gherkinDocument.feature;
            if (feature == undefined)
                throw `feature not found in gherkinDocument with uri ${uri}`;

            const background = feature.children.find(child => child.background)?.background;

            return {
                name: feature.name,
                scenarios: feature.children
                    .filter(child => child.scenario)
                    .map(child => child.scenario)
                    .map(scenario => {
                        const pickles = chunks.filter(chunk => chunk.pickle?.astNodeIds.includes(scenario.id));
                        const steps = (background?.steps ?? []).concat(scenario.steps);

                        if (pickles.length === 0)
                            throw `pickle not found for scenario with id ${scenario.id} in gherkinDocument with uri ${uri}`;

                        if (pickles.length == 1) {
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

function mapStep(pickle, step, index) {
    const pickleStep = pickle.steps[index];
    if (pickleStep == undefined)
        throw `step ${index} not found in pickle with id ${pickle.id}`;

    return {
        id: step.id,
        type: step.keyword.trim().toLowerCase(),
        keyword: step.keyword.trim(),
        name: pickleStep.text,
        template: step.text
    };
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

async function getChunks(files) {
    return new Promise((resolve, reject) => {
        const stream = GherkinStreams.fromPaths(files)
        const chunks = [];

        stream.on("data", function (chunk) {
            chunks.push(chunk);
        });

        // Send the buffer or you can put it into a var
        stream.on("end", function () {
            resolve(chunks);
        });

        stream.on('error', function (err) {
            reject(err);
        });
    });
}