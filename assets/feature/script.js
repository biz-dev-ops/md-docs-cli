function __init(schema) {
    const data = transformToMustacheData(schema);

    console.log(data);

    const html = Mustache.render(TEMPLATE, { data: data }, PARTIALS);

    document.body.insertAdjacentHTML("beforeend", html);
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
        status: getScenarioStatus(index),
        steps: transformToSteps(child.steps)
    };
}

function transformToSteps(steps) {
    return steps        
        .filter(c => c.type == "Step")
        .map(transformToStep);
}

function transformToStep(step) {
    return {
        type: step.keyword.trim().toLowerCase(),
        keyword: step.keyword.trim(),
        text: step.text
    };
}

function getScenarioStatus(index) {
    switch (index) {
        case 1:
            return "not-implemented";
        case 2:
            return "failing";
        default:
            return "success";
    }
}

const TEMPLATE = `{{#data}}
<ul class="scenarios">
    {{#scenarios}}
        <li class="scenario {{status}}">
            <span>{{name}}</span>

            <ul class="steps">
                {{#steps}}
                    <li class="step {{type}}">
                        <span class="keyword">{{keyword}}</span> <span>{{text}}</span>
                    </li>
                {{/steps}}
            </ul>
        </li>
    {{/scenarios}}
</ul>
{{/data}}`;

const PARTIALS = { };