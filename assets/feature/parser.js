const Parser = (function () {

    const transformToFeatures = function (items, executionResults) {
        return items
            .filter(item => item.source)
            .map(item => item.source.uri)
            .map(uri => ({
                uri: uri,
                feature: items.find(item => item.gherkinDocument?.uri === uri).gherkinDocument?.feature
            }))
            .map(data => transformToFeature(data.uri, data.feature, items, (executionResults.filter(e => e.FeatureTitle === feature.name)) ?? []));
    }

    const transformToFeature = function (uri, feature, items, executionResults) {
        const scenarios = items
            .filter(item => item.pickle?.uri === uri)
            .map(item => item.pickle)
            .map(pickle => ({
                pickle: pickle,
                background: feature.children.find(c => c.background)?.background,
                scenario: feature.children.find(c => c.scenario && c.scenario.id === pickle.astNodeIds[0]).scenario
            }))
            .map(d => transformToScenario(d, findExecutionResult(executionResults, d)));

        return {
            name: feature.name,
            scenarios: scenarios,
            status: {
                type: parseChildStatus(scenarios)
            }
        }
    }

    const findExecutionResult = function (executionResults, data) {
        const title = data.pickle.name;

        for (const result of executionResults) {
            let executionTitle = result.ScenarioTitle;

            result.ScenarioArguments.forEach((argument, index) => {
                const name = getArgumentName(data.scenario, index);
                if (name)
                    executionTitle = executionTitle.replace(`<${name}>`, argument);
            });

            if (title === executionTitle)
                return result;
        }

        return null;
    };

    const getArgumentName = function (scenario, index) {
        if (scenario == undefined)
            return null;

        const example = data.scenario.examples[0];
        if (example == undefined)
            return null;

        const cell = example.tableHeader.cells[index];
        if (cell == undefined)
            return null;

        return cell.value;
    }

    const transformToScenario = function (data, executionResult) {
        const steps = data.pickle.steps
            .map((s, i) => (
                Object.assign(s, {
                    keyword: (
                        data.scenario.steps.find(ss => ss.id == s.astNodeIds[0]) ||
                        data.background?.steps.find(ss => ss.id == s.astNodeIds[0])
                    ).keyword
                }))
            )
            .map(s => transformToStep(s, executionResult?.stepResults[i]));

        return {
            id: data.pickle.id,
            name: data.pickle.name,
            steps: steps,
            status: {
                type: parseChildStatus(steps)
            }
        };
    }

    const transformToStep = function (step, stepResult) {
        return {
            id: step.id,
            type: step.keyword.trim().toLowerCase(),
            keyword: step.keyword.trim(),
            text: step.text,
            status: {
                type: parseExecutionStatus(stepResult)
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
                        .map(s => s.steps.filter(s => s.status.type != "passed" && s.status.type != "failed").length)
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

    const parseChildStatus = function (children) {
        if (children.some(c => c.status.type === "failed"))
            return "failed";

        if (children.some(c => c.status.type != "failed" && c.status.type != "passed"))
            return "other";

        return "passed";
    };

    const parseExecutionStatus = function (stepResult) {
        switch (stepResult?.Status) {
            case "OK":
                return "passed";
            case "TestError":
                return "failed";
            case "StepDefinitionPending":
                return "pending"
            case "UndefinedStep":
                return "undefined"
            case "Skipped":
                return "skipped";
        }
        return null;
    }

    return {
        parse: function (gherkin, executions) {
            const features = transformToFeatures(gherkin, executions);
            const summary = summarize(features);

            const parsed = { features, summary };
            return parsed;
        }
    };
})();
