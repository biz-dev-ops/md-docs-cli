function __init(schema) {
    const data = transformToMustacheData(schema);

    const html = Mustache.render(TEMPLATE, { data: data }, PARTIALS);

    document.body.insertAdjacentHTML("beforeend", html);

    // Scenarios accordion
    const scenarios = document.querySelectorAll('.scenario');
    scenarios.forEach(scenario => {
        const toggle = scenario.querySelector('button.item');
        const steps = scenario.querySelector('.steps');

        steps.setAttribute('hidden',  'hidden');
        toggle.setAttribute('aria-expanded', 'false');

        toggle.onclick = e => {
            const expanded = toggle.getAttribute('aria-expanded') !== "false";
            if (expanded) {
                steps.setAttribute('hidden',  'hidden');
                toggle.setAttribute('aria-expanded', 'false');
            } else {
                steps.removeAttribute('hidden');
                toggle.setAttribute('aria-expanded', 'true');
            }

        };
    })
};

function transformToMustacheData(schema) {
    const feature = schema.find(i => i.gherkinDocument).gherkinDocument.feature;   

    return {
        name: feature.name,
        scenarios: schema
                .filter(i => i.pickle)
                .map(i => ({
                    pickle: i.pickle,
                    background: feature.children.find(c => c.background)?.background,
                    scenario: feature.children.find(c => c.scenario && c.scenario.id === i.pickle.astNodeIds[0]).scenario
                }))
                .map(transformToScenario)
    };        
}
function transformToScenario(data, index) {
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
            type: getStatus(data.pickle.id)
        }
    };
}

function transformToStep(step, index) {
    return {
        id: step.id,
        type: step.keyword.trim().toLowerCase(),
        keyword: step.keyword.trim(),
        text: step.text,
        status: {
            type: getStatus(step.id)
        }
    };
}

function getStatus(id) {
    return "passed";

    //other, failed
}

const TEMPLATE = `{{#data}}
<ul class="scenarios">
    {{#scenarios}}
        <li class="scenario {{status.type}}">
            <button class="item" aria-expanded="true">{{name}}</button>

            <ul class="steps">
                {{#steps}}
                    <li class="step {{type}} {{status.type}}">
                        <span class="item">
                            <span class="keyword">{{keyword}}</span> <span>{{text}}</span>
                        </span>
                    </li>
                {{/steps}}
            </ul>
        </li>
    {{/scenarios}}
</ul>
{{/data}}`;

const PARTIALS = { };