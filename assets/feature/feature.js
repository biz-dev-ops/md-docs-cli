function __init(schema) {
    const data = Parser.parse(schema.features, schema.executions);

    const html = Mustache.render(TEMPLATE, { feature: data.features[0] }, PARTIALS);

    document.body.insertAdjacentHTML("beforeend", html);

    // Init collapse
    collapse();
};

const TEMPLATE = `{{#feature}}
<ul class="collapse-list scenarios">
    {{#scenarios}}
        <li class="scenario has-children">
            <button role="button"  class="status status-{{status.type}}" data-toggle="collapse" aria-controls="steps-{{id}}" aria-expanded="false">{{name}}</button>

            <ul class="steps" id="steps-{{id}}">
                {{#steps}}
                    <li class="step {{type}}">
                        <span class="status status-bg status-{{status.type}}">
                            <span class="keyword">{{keyword}}</span> <span>{{text}}</span>
                        </span>
                    </li>
                {{/steps}}
            </ul>
        </li>
    {{/scenarios}}
</ul>
{{/feature}}`;

const PARTIALS = { };