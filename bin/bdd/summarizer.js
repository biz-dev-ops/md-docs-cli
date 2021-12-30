exports.summarize = (features) => {
    const summary = {
        features: {
            total: features.length,
            passed: features.filter(f => f.status.type === "passed").length,
            failed: features.filter(f => f.status.type === "failed").length,
            other: features.filter(f => f.status.type === "other").length,
        },
        scenarios: {
            total: features
                .map(f => f.scenarios.length)
                .reduce(add, 0),
            passed: features
                .map(f => f.scenarios.filter(s => s.status.type === "passed").length)
                .reduce(add, 0),
            failed: features
                .map(f => f.scenarios.filter(s => s.status.type === "failed").length)
                .reduce(add, 0),
            other: features
                .map(f => f.scenarios.filter(s => s.status.type === "other").length)
                .reduce(add, 0)
        },
        steps: {
            total: features
                .map(f => f.scenarios
                    .map(s => s.steps.length)
                    .reduce(add, 0)
                )
                .reduce(add, 0),
            passed: features
                .map(f => f.scenarios
                    .map(s => s.steps.filter(s => s.status?.type === "passed").length)
                    .reduce(add, 0)
                )
                .reduce(add, 0),
            failed: features
                .map(f => f.scenarios
                    .map(s => s.steps.filter(s => s.status?.type === "failed").length)
                    .reduce(add, 0)
                )
                .reduce(add, 0),
            other: features
                .map(f => f.scenarios
                    .map(s => s.steps.filter(s => s.status?.type != "passed" && s.status?.type != "failed").length)
                    .reduce(add, 0)
                )
                .reduce(add, 0)
        }
    };

    summary.features.status = getStatus(summary.features);
    summary.scenarios.status = getStatus(summary.scenarios);
    summary.steps.status = getStatus(summary.steps);

    return summary;
}

const getStatus = function (summary) {
    if (summary.failed > 0)
        return "failed";

    if (summary.other > 0)
        return "other";

    if (summary.passed > 0)
        return "passed";

    return null;
}

function add(accumulator, a) {
    return accumulator + a;
}