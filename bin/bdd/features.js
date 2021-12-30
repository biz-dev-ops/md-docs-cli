const Mustache = require('mustache');

exports.render = (features) => {
    return Mustache.render(TEMPLATE, features, PARTIALS);    
}

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