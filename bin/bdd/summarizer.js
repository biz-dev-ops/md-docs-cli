exports.summarize = (features) => {
    const scenarios = features
        .flatMap(feature =>
            feature.scenarios
                .flatMap(scenario => scenario.scenarios ? scenario.scenarios : [scenario])
    );
    
    const steps = scenarios
        .flatMap(scenario => scenario.steps);
    
    const summary = {
        features: getStatusSummary(features),
        scenarios: getStatusSummary(scenarios),
        steps: getStatusSummary(steps)
    }
    
    return summary;
}

const getStatusSummary = function(collection) {
    const statuses = {
        total: 0
    };

    if (collection == undefined)
        return statuses;

    for (const item of collection) {
        if (statuses[item.status.type] == undefined) {
            statuses[item.status.type] = 0;
        }

        statuses[item.status.type] += 1;
        statuses.total += 1;
    }

    return statuses;
}

const getStatus = function (summary) {
    const status = {};
    if (summary.failed > 0)
        status.type = 'failed';
    else if (summary.other > 0)
        status.type = 'failed';

    else if (summary.passed > 0)
        status.type = 'failed';

    return status;
}

function add(accumulator, a) {
    return accumulator + a;
}