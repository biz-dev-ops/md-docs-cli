module.exports = class TestExecutionsParser {
    
    constructor({ testExecutionParsers }) {
        this.testExecutionParsers = testExecutionParsers;
    }

    async parse(features) {
        if (features == undefined)
            throw new Error(`features is not defined`);

        setDefaultValue(features);
        
        for (const feature of features) {
            const results = await this.#getFeatureResults(feature);

            for (const outline of feature.scenarios.filter(s => s.scenarios)) {
                for (const scenario of outline.scenarios) {
                    results.parse(scenario);
                    scenario.result = {
                        status: getAggregateResult(scenario.steps)
                    };
                }
    
                outline.result = {
                    status: getAggregateResult(outline.scenarios)
                };
            }
    
            for (const scenario of feature.scenarios.filter(s => s.steps)) {
                results.parse(scenario);
                scenario.result = {
                    status: getAggregateResult(scenario.steps)
                };
            }
    
            feature.result = {
                status: getAggregateResult(feature.scenarios)
            };
        }
    }
    
    async #getFeatureResults(feature) {
        for (const parser of this.testExecutionParsers) {
            const results = await parser.results(feature);
            if(results)
                return results;
        }
        return null;
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
    if(collection.every(child => child.result.status === 'passed'))
        return 'passed';

    if (collection.some(child => child.result.status === 'failed'))
        return 'failed';

    if (collection.some(child => child.result.status === 'other'))
        return 'other';
    
    if (collection.some(child => child.result.status === 'pending'))
        return 'other';
    
    if (collection.some(child => child.result.status === 'skipped'))
        return 'other';
    
    if (collection.some(child => child.result.status === 'undefined'))
        return 'undefined';

    return 'other';
}