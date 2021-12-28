function __init(schema) {
    const data = Parser.parse(schema.features, schema.executions);

    const html = Mustache.render(TEMPLATE, { feature: data.features[0] }, PARTIALS);

    document.body.insertAdjacentHTML("beforeend", html);
};

const TEMPLATE = `{{#feature}}
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
{{/feature}}`;

const PARTIALS = { };