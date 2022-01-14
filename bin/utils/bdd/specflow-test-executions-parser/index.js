exports.parse = (features, executions) => {
    if (features == undefined)
        throw new Error(`files is not defined`);

    if (executions == undefined || executions.length === 0) {
        setUndefined(features);
        return;
    }

    const results = executions.flatMap(e => e.ExecutionResults);

    for (const feature of features) {
        for (const outline of feature.scenarios.filter(s => s.scenarios)) {
            for (const scenario of outline.scenarios) {
                const result = results.find(result => equals(result, feature, scenario));
                setResults(scenario, result);
            }

            outline.result = {
                status: getAggregateResult(outline.scenarios)
            };
        }

        for (const scenario of feature.scenarios.filter(s => s.steps)) {
            const result = results.find(result => equals(result, feature, scenario));
            setResults(scenario, result);
        }

        feature.result = {
            status: getAggregateResult(feature.scenarios)
        };
    }
}

setUndefined = function (collection) {
    if (collection == undefined)
        return;

    for (const item of collection) {
        item.result = { status: 'undefined' };
        setUndefined(item.scenarios);
        setUndefined(item.steps);
    }
}

setResults = function (scenario, result) {
    scenario.steps.forEach((step, index) => {
        step.result = parseStepResult(result?.StepResults[index]);
    });
    
    scenario.result = {
        status: getAggregateResult(scenario.steps)
    }
}

getAggregateResult = function (collection) {
    if (collection.some(child => child.result.status === 'failed'))
        return 'failed';

    if (collection.some(child => child.result.status === 'other'))
        return 'other';
    
    if (collection.some(child => child.result.status === 'undefined'))
        return 'other';
    
    if (collection.some(child => child.result.status === 'pending'))
        return 'other';
    
    if (collection.some(child => child.result.status === 'skipped'))
        return 'other';

    return 'passed';
}

equals = function (result, feature, scenario) {
    if (result.FeatureTitle !== feature.name)
        return false;

    if (result.ScenarioArguments?.length === 0) {
        return result.ScenarioTitle === scenario.name;
    }
    else {
        if (result.ScenarioTitle !== scenario.template)
            return false;

        if (result.ScenarioArguments.length !== scenario.arguments.length)
            return false;

        for (var i = 0, len = result.ScenarioArguments.length; i < len; i++) {
            if (result.ScenarioArguments[i] !== scenario.arguments[i])
                return false;
        }
        return true;
    }
}

const parseStepResult = function (stepResult) {
    const result = {
        status: 'undefined'
    }

    switch (stepResult?.Status) {
        case 'OK':
            result.status = 'passed';
            break;
        case 'TestError':
            result.status = 'failed';
            break;
        case 'StepDefinitionPending':
            result.status = 'pending';
            break;
        case 'UndefinedStep':
            result.status = 'undefined';
            break;
        case 'Skipped':
            result.status = 'skipped';
            break;
        default:
            result.status = 'undefined';
            break;
    }

    return result;
}