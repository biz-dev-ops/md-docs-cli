function __init(schema) {
    const data = transformToMustacheData(schema);

    console.log(data);

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
    const feature = schema.feature;

    return {
        name: feature.name,
        scenarios: transformToScenarios(feature.children)
    };        
}

function transformToScenarios(children) {
    return children
        .filter(c => c.type == "Scenario")
        .map(transformToScenario);
}
function transformToScenario(child, index) {
    return {
        name: child.name,
        steps: transformToSteps(child.steps),
        status: {
            type: getStatus(index)
        }
    };
}

function transformToSteps(steps) {
    return steps        
        .filter(c => c.type == "Step")
        .map(transformToStep);
}

function transformToStep(step, index) {
    return {
        type: step.keyword.trim().toLowerCase(),
        keyword: step.keyword.trim(),
        text: step.text,
        status: {
            type: getStatus(index)
        }
    };
}

function getStatus(index) {
    switch (index) {
        case 1:
            return "other";
        case 2:
            return "failed";
        default:
            return "passed";
    }
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