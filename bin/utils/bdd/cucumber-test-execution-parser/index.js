module.exports = class CucumberTestExecutionParser {
    #executions = null;

    constructor({ testExecutionStore }) {
        this.testExecutionStore = testExecutionStore;
    }

    async results(feature) {
        await this.#init();

        const result = this.#executions
            .filter(e => Array.isArray(e))
            .flatMap(e => e)
            .find(f => f.name.includes(feature.hash));

        return new CucumberTestExecutionFeatureResult(result);
    }

    async #init() {
        if (this.#executions == null) {
            this.#executions = await this.testExecutionStore.get();
            if (this.#executions === null)
                this.#executions = [];
        }
    }
}

class CucumberTestExecutionFeatureResult {
    constructor(result) {
        this.result = result ?? { elements: [] };
        this.background = this.result.elements.find(e => e.type == 'background') ?? { steps: [] };

        this.result.elements = this.result.elements
            .filter(e => e.type != 'background')
            .map(e => {
                e.steps = this.background.steps.concat(e.steps);
                return e;
            });
    }

    parse(scenario) {
        const scenarioResult = this.#getScenarioResult(scenario);

        for (var i = 0, len = scenarioResult.steps.length; i < len; i++) {
            scenario.steps[i].result = this.#parseStepResult(scenarioResult.steps[i].result);
        }
    }

    #getScenarioResult(scenario) {
        let scenarioResults = this.result.elements.filter(e => e.type === 'scenario' && e.name === scenario.name);
        if (scenarioResults.length > 1)
            scenarioResults = scenarioResults.filter(s => s.keyword === 'Scenario Outline');

        return scenarioResults.find(scenarioResult => {
            if (scenario.steps.length != scenarioResult.steps.length)
                return false;

            for (var i = 0, len = scenario.steps.length; i < len; i++) {
                if (scenario.steps[i].keyword.trim() != scenarioResult.steps[i].keyword.trim())
                    return false;

                if (scenario.steps[i].text != scenarioResult.steps[i].name)
                    return false;
            }
            return true;
        }) || { steps: [] };
    }

    #parseStepResult(stepResult) {
        const result = {};

        switch (stepResult.status) {
            case 'passed':
                console.log('ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss')
                result.status = 'passed';
                break;
            case 'failed':
                result.status = 'failed';
                break;
            case 'pending':
                result.status = 'pending';
                break;
            case 'skipped':
                result.status = 'skipped';
                break;
            default:
                result.status = 'undefined';
                break;
        }

        return result;
    }
}