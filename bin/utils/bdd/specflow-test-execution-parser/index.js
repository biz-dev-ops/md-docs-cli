module.exports = class SpecflowTestExecutionParser {
    #executions = null;

    constructor({ testExecutionStore }) {
        this.testExecutionStore = testExecutionStore;
    }

    async results(feature) {
        await this.#init();

        const result = this.#executions
            .filter(e => Array.isArray(e?.ExecutionResults))
            .flatMap(e => e.ExecutionResults)
            .filter(r => r.FeatureTitle.includes(feature.hash));

        return new SpecflowTestExecutionFeatureResult(result);
    }

    async #init() {
        if (this.#executions == null) {
            this.#executions = await this.testExecutionStore.get();
            if (this.#executions === null)
                this.#executions = [];
        }
    }
}

class SpecflowTestExecutionFeatureResult {
    constructor(result) {
        this.result = result ?? [];
    }

    parse(scenario) {
        const scenarioResult = this.#getScenarioResult(scenario);

        for (var i = 0, len = scenarioResult.StepResults.length; i < len; i++) {
            scenario.steps[i].result = this.#parseStepResult(scenarioResult.StepResults[i]);
        }
    }

    #getScenarioResult(scenario) {
        return this.result.find(result => {
            if (scenario.arguments == null || scenario.arguments.length === 0) {
                return scenario.name === result.ScenarioTitle;
            }
            else {
                if (scenario.template !== result.ScenarioTitle)
                    return false;

                if (scenario.arguments.length !== result.ScenarioArguments.length)
                    return false;
        
                for (var i = 0, len = scenario.arguments.length; i < len; i++) {
                    if (scenario.arguments[i] !== result.ScenarioArguments[i])
                        return false;
                }
                return true;
            }
        }) || { StepResults: [] };
        
    }

    #parseStepResult(stepResult) {
        const result = {};

        switch (stepResult.Status) {
            case 'OK':
                result.status = 'passed';
                break;
            case 'TestError':
                result.status = 'failed';
                break;
            case 'StepDefinitionPending':
                result.status = 'pending';
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
}