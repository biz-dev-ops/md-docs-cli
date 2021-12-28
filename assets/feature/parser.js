const Parser = (function () {

    const transformToFeatures = function (items, executions) {
        return items
            .filter(item => item.source)
            .map(item => item.source.uri)
            .map(uri => ({
                uri: uri,
                feature: items.find(item => item.gherkinDocument?.uri === uri).gherkinDocument?.feature
            }))
            .map(data => transformToFeature(data.uri, data.feature, items));
    }

    const transformToFeature = function (uri, feature, items) {
        return {
            name: feature.name,
            scenarios: items
                .filter(item => item.pickle?.uri === uri)
                .map(item => item.pickle)
                .map(pickle => ({
                    pickle: pickle,
                    background: feature.children.find(c => c.background)?.background,
                    scenario: feature.children.find(c => c.scenario && c.scenario.id === pickle.astNodeIds[0]).scenario
                }))
                .map(transformToScenario),
            status: {
                type: "passed"
            }
        }
    }

    const transformToScenario = function (data) {
        return {
            id: data.pickle.id,
            name: data.pickle.name,
            steps: data.pickle.steps
                .map(s => (
                    Object.assign(s, {
                        keyword: (
                            data.scenario.steps.find(ss => ss.id == s.astNodeIds[0]) ||
                            data.background?.steps.find(ss => ss.id == s.astNodeIds[0])
                        ).keyword
                    }))
                )
                .map(transformToStep),
            status: {
                type: "passed"
            }
        };
    }

    const transformToStep = function (step) {
        return {
            id: step.id,
            type: step.keyword.trim().toLowerCase(),
            keyword: step.keyword.trim(),
            text: step.text,
            status: {
                type: "passed"
            }
        };
    }

    const summarize = function (features) {
        function add(accumulator, a) {
            return accumulator + a;
        }

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
                        .map(s => s.steps.filter(s => s.status.type === "passed").length)
                        .reduce(add, 0)
                    )
                    .reduce(add, 0),
                failed: features
                    .map(f => f.scenarios
                        .map(s => s.steps.filter(s => s.status.type === "failed").length)
                        .reduce(add, 0)
                    )
                    .reduce(add, 0),
                other: features
                    .map(f => f.scenarios
                        .map(s => s.steps.filter(s => s.status.type === "other").length)
                        .reduce(add, 0)
                    )
                    .reduce(add, 0)
            }
        };

        const getSummaryStatus = function (summary) {
            if (summary.failed > 0)
                return "failed";
            
            if (summary.other > 0)
                return "other";
            
            if (summary.passed > 0)
                return "passed";
            
            return null;
        }

        summary.features.status = getSummaryStatus(summary.features);
        summary.scenarios.status = getSummaryStatus(summary.scenarios);
        summary.steps.status = getSummaryStatus(summary.steps);
        
        return summary;
    }

    return {
        parse: function (gherkin, executions) {
            const features = transformToFeatures(gherkin, executions);
            const summary = summarize(features);

            const parsed = { features, summary };

            console.log(parsed);

            return parsed;
        }
    };
})();
