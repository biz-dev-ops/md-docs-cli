exports.parse = (features, executions) => {
    if (features == undefined)
        throw new Error(`files is not defined`);

    if (executions == undefined || executions.length === 0) {
        setUndefined(features);
        return;
    }

    for (const feature of features) {
        const scenarios = flatten(feature.scenarios);

        for (const scenario of scenarios) {
            const execution = executions.find(execution => equals(execution, scenario));

            scenario.steps.map((step, index) => {
                step.result = parse(execution?.StepResults[index]);
            });

            scenario.result = {
                type: (() => {
                    if (scenario.steps.some(step => step.result.type === 'failed'))
                        return 'failed';

                    if (scenario.steps.some(step => step.result.type != 'failed' && step.result.type != 'passed'))
                        return 'other';

                    return 'passed';
                })()
            }
        }

        feature.result = {
            type: (() => {
                if (feature.scenarios.some(scenario => scenario.result.type === 'failed'))
                    return 'failed';

                if (feature.scenarios.some(scenario => scenario.result.type != 'failed' && scenario.result.type != 'passed'))
                    return 'other';

                return 'passed';
            })()
        }
    }
}

setUndefined = function (collection) {
    if (collection == undefined)
        return;
    
    for (const item of collection) {
        item.status = { type: 'undefined' };
        setUndefined(item.scenarios);
        setUndefined(item.steps);
    }
}

const equals = function (execution, feature) {
    if (execution.FeatureTitle !== feature.name)
        return false;

    if (execution.ScenarioArguments.length === 0) {
        return execution.ScenarioTitle === scenario.name;
    }
    else {
        if (execution.ScenarioTitle !== scenario.template)
            return false;

        if (execution.ScenarioArguments.length !== scenario.arguments.length)
            return false;

        for (var i = 0, len = execution.ScenarioArguments.length; i < len; i++) {
            if (execution.ScenarioArguments[i] !== scenario.arguments[i])
                return false;
        }
        return true;
    }
}

const flatten = function (scenarios) {
    const items = [];

    if (scenarios == undefined)
        return items;

    for (const scenario of scenarios) {
        if (scenario.scenarios)
            items.push(getScenarios(scenario.scenarios));
        else
            items.push(scenario);
    }
    return items;
}

const parse = function (stepResult) {
    const result = {
        status: null
    }

    switch (stepResult?.Status) {
        case "OK":
            result.status = "passed";
        case "TestError":
            result.status = "failed";
        case "StepDefinitionPending":
            result.status = "pending";
        case "UndefinedStep":
            result.status = "undefined";
        case "Skipped":
            result.status = "skipped";
        default:
            result.status = "undefined";
    }

    return result;
}