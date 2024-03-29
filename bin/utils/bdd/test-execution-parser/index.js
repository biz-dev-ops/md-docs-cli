module.exports = class TestExecutionsParser {
    
    constructor({ testExecutionParsers }) {
        this.testExecutionParsers = testExecutionParsers;
    }

    async parse(features) {
        if (features == undefined)
            throw new Error(`features is not defined`);

        setDefaultValue(features);
        
        for (const feature of features) {
            const parsers = await this.#getFeatureResultParsers(feature);

            for (const outline of feature.scenarios.filter(s => s.scenarios)) {
                for (const scenario of outline.scenarios) {
                    parsers.parse(scenario);
                    scenario.result = {
                        status: getAggregateResult(scenario.steps)
                    };
                }
    
                outline.result = {
                    status: getAggregateResult(outline.scenarios)
                };
            }
    
            for (const scenario of feature.scenarios.filter(s => s.steps)) {
                parsers.parse(scenario);
                scenario.result = {
                    status: getAggregateResult(scenario.steps)
                };
            }
    
            feature.result = {
                status: getAggregateResult(feature.scenarios)
            };
        }
    }
    
    async #getFeatureResultParsers(feature) {
        const parsers = [];

        for (const testExecutionParser of this.testExecutionParsers) {
            const parser = await testExecutionParser.results(feature);
            parsers.push(parser);
        }
        return new CompositeResultsParser(parsers);
    }
}

class CompositeResultsParser {
    constructor(parsers) {
        this.parsers = parsers;
    }

    parse(scenario) {
        for(const parser of this.parsers) {
            parser.parse(scenario);
        }
    }
}

setDefaultValue = function (collection) {
    if (collection == undefined)
        return;

    for (const item of collection) {
        item.result = { status: 'undefined' };
        setDefaultValue(item.scenarios);
        setDefaultValue(item.steps);
    }
}

getAggregateResult = function (collection) {
    if(collection.length === 0)
        return [ 'undefined' ];

    const status = [
        ...new Set (
            collection.flatMap(child => {
                if(Array.isArray(child.result.status))
                    return child.result.status;

                switch(child.result.status) {
                    case 'passed':
                    case 'failed':
                    case 'undefined':
                        return child.result.status
                    default:
                        return 'other'
                }
            })
        )
    ];

    return status;
}