function __init(schema) {
    const data = Parser.parse(schema.features, schema.executions);

    const html = Mustache.render(TEMPLATE, data.summary, PARTIALS);

    document.body.insertAdjacentHTML("beforeend", html);

    // Scenarios accordion
    const scenarios = document.querySelectorAll('.scenario');
    scenarios.forEach(scenario => {
        const toggle = scenario.querySelector('button.item');
        const steps = scenario.querySelector('.steps');

        steps.setAttribute('hidden', 'hidden');
        toggle.setAttribute('aria-expanded', 'false');

        toggle.onclick = e => {
            const expanded = toggle.getAttribute('aria-expanded') !== "false";
            if (expanded) {
                steps.setAttribute('hidden', 'hidden');
                toggle.setAttribute('aria-expanded', 'false');
            } else {
                steps.removeAttribute('hidden');
                toggle.setAttribute('aria-expanded', 'true');
            }

        };
    });
};

const TEMPLATE = `
<ul class="scenarios">    
    <li class="scenario {{features.status}}">
        <button class="item" aria-expanded="true">{{ features.total }} features</button>

        <ul class="steps">
            <li class="passed">
                <span class="item">
                    <span class="keyword">Passed</span> <span>{{features.passed}}</span>
                </span>
            </li>
            <li class="failed">
                <span class="item">
                    <span class="keyword">Failed</span> <span>{{features.failed}}</span>
                </span>
            </li>
            <li class="other">
                <span class="item">
                    <span class="keyword">Other</span> <span>{{features.other}}</span>
                </span>
            </li>
        </ul>
    </li>
    <li class="scenario {{scenarios.status}}">
        <button class="item" aria-expanded="true">{{ scenarios.total }} scenarios</button>

        <ul class="steps">
            <li class="passed">
                <span class="item">
                    <span class="keyword">Passed</span> <span>{{scenarios.passed}}</span>
                </span>
            </li>
            <li class="failed">
                <span class="item">
                    <span class="keyword">Failed</span> <span>{{scenarios.failed}}</span>
                </span>
            </li>
            <li class="other">
                <span class="item">
                    <span class="keyword">Other</span> <span>{{scenarios.other}}</span>
                </span>
            </li>
        </ul>
    </li>
    <li class="scenario {{steps.status}}">
        <button class="item" aria-expanded="true">{{ steps.total }} steps</button>

        <ul class="steps">
            <li class="passed">
                <span class="item">
                    <span class="keyword">Passed</span> <span>{{steps.passed}}</span>
                </span>
            </li>
            <li class="failed">
                <span class="item">
                    <span class="keyword">Failed</span> <span>{{steps.failed}}</span>
                </span>
            </li>
            <li class="other">
                <span class="item">
                    <span class="keyword">Other</span> <span>{{steps.other}}</span>
                </span>
            </li>
        </ul>
    </li>
</ul>`;

const PARTIALS = { };