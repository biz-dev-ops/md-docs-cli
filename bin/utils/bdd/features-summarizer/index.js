exports.summarize = (features) => {
    const scenarios = features
        .flatMap(feature =>
            feature.scenarios
                .flatMap(scenario => scenario.scenarios ? scenario.scenarios : [scenario])
        );

    const steps = scenarios
        .flatMap(scenario => scenario.steps);

    const summary = {
        "use-cases": getStatusSummary(features),
        scenarios: getStatusSummary(scenarios),
        steps: getStatusSummary(steps)
    }

    return summary;
}

const getStatusSummary = function (collection) {
    const statuses = {
        total: { value: 0 },
        passed: { value: 0 },
        failed: { value: 0 },
        undefined: { value: 0 }
    };

    if (collection == undefined)
        return statuses;

    for (const item of collection) {
        if (item.result == undefined) {
            item.result = {
                status: "undefined"
            };
        }

        if (statuses[item.result.status] == undefined) {
            statuses[item.result.status] = { value: 0 };
        }

        statuses[item.result.status].value += 1;
        statuses.total.value += 1;
    }

    let offset = 0;
    for (const [key, status] of Object.entries(statuses)) {
        if (key !== 'total') {
            status.percentage = Math.round((status.value / statuses.total.value) * 100);
            status.offset = offset;
            offset += status.percentage;
        }
    }

    return statuses;
}