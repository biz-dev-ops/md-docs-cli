function __init(schema) {
    const data = Parser.parse(schema.features, schema.executions);

    // Add feature id
    data.features.map((feature, index) => {
        const name = feature.name.toLowerCase();
        feature["id"] = encodeURIComponent(name).replace(/%20/g,'-');
        return feature;
    })

    const percentageOf = (value, total) => {
        return Math.round(value / total * 1000) / 10;
    }

    const summaryHtml = Mustache.render(SUMMARY_TEMPLATE, data.summary, PARTIALS);
    const featuresHtml = Mustache.render(FEATURES_TEMPLATE, data, PARTIALS);

    document.body.insertAdjacentHTML("beforeend", summaryHtml);
    document.body.insertAdjacentHTML("beforeend", featuresHtml);

    // Init collapse
    collapse();

    // Charts
    const doughnutCharts = document.querySelectorAll('svg.chart-doughnut');
    doughnutCharts.forEach(chart => {
        const passedEl = chart.querySelector('.circle-passed');
        const failedEl = chart.querySelector('.circle-failed');
        const passed = percentageOf(chart.dataset.passed, chart.dataset.total);
        const failed = percentageOf(chart.dataset.failed, chart.dataset.total);

        if (!passed) passedEl.setAttribute('hidden', 'hidden');
        passedEl.setAttribute('stroke-dasharray',  passed + " 100");

        if (!failed) failedEl.setAttribute('hidden', 'hidden');
        failedEl.setAttribute('stroke-dasharray', failed + " 100");
        failedEl.setAttribute('stroke-dashoffset', (passed * -1));
    });
};

const SUMMARY_TEMPLATE = `
<h3>Features</h3>
<div class="dashboard">
    <figure class="chart chart-doughnut">
        <svg viewBox="0 0 36 36" class="chart-doughnut"
            data-total="{{ features.total }}"
            data-passed="{{ features.passed }}"
            data-failed="{{ features.failed }}"
        >
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              class="circle circle-base"
              stroke-width="4.169"
            />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              class="circle circle-failed"
              stroke-width="4.169"
              stroke-dasharray="0, 100"
            />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              class="circle circle-passed"
              stroke-width="4.169"
              stroke-dasharray="0, 100"
            />
            <text x="18" y="21" class="text">{{ features.total }}</text>
        </svg>
    </figure>
    
    <ul class="legend">
        <li class="legend-passed">
            <span class="percentage">100.0%</span>
            <span class="count">{{ features.passed }}</span>
            <span class="label">Passed</span>
        </li>
        <li class="legend-failed">
            <span class="percentage">0.0%</span>
            <span class="count">{{ features.failed }}</span>
            <span class="label">Failed</span>
        </li>
        <li class="legend-other">
            <span class="percentage">0.0%</span>
            <span class="count">{{ features.other }}</span>
            <span class="label">Others</span>
        </li>
    </ul>
</div>

<h3>Scenarios</h3>
<div class="dashboard">
    <figure class="chart chart-doughnut">
        <svg viewBox="0 0 36 36" class="chart-doughnut"
            data-total="{{ scenarios.total }}"
            data-passed="{{ scenarios.passed }}"
            data-failed="{{ scenarios.failed }}"
        >
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              class="circle circle-base"
              stroke-width="4.169"
            />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              class="circle circle-failed"
              stroke-width="4.169"
              stroke-dasharray="0, 100"
            />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              class="circle circle-passed"
              stroke-width="4.169"
              stroke-dasharray="0, 100"
            />
            <text x="18" y="21" class="text">{{ scenarios.total }}</text>
        </svg>
    </figure>
    
    <ul class="legend">
        <li class="legend-passed">
            <span class="percentage">100.0%</span>
            <span class="count">{{ scenarios.passed }}</span>
            <span class="label">Passed</span>
        </li>
        <li class="legend-failed">
            <span class="percentage">0.0%</span>
            <span class="count">{{ scenarios.failed }}</span>
            <span class="label">Failed</span>
        </li>
        <li class="legend-other">
            <span class="percentage">0.0%</span>
            <span class="count">{{ scenarios.other }}</span>
            <span class="label">Others</span>
        </li>
    </ul>
</div>

<h3>Steps</h3>
<div class="dashboard">
    <figure class="chart chart-doughnut">
        <svg viewBox="0 0 36 36" class="chart-doughnut"
            data-total="{{ steps.total }}"
            data-passed="{{ steps.passed }}"
            data-failed="{{ steps.failed }}"
        >
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              class="circle circle-base"
              stroke-width="4.169"
            />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              class="circle circle-failed"
              stroke-width="4.169"
              stroke-dasharray="0, 100"
            />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              class="circle circle-passed"
              stroke-width="4.169"
              stroke-dasharray="0, 100"
            />
            <text x="18" y="21" class="text">{{ steps.total }}</text>
        </svg>
    </figure>
    
    <ul class="legend">
        <li class="legend-passed">
            <span class="percentage">100.0%</span>
            <span class="count">{{ steps.passed }}</span>
            <span class="label">Passed</span>
        </li>
        <li class="legend-failed">
            <span class="percentage">0.0%</span>
            <span class="count">{{ steps.failed }}</span>
            <span class="label">Failed</span>
        </li>
        <li class="legend-other">
            <span class="percentage">0.0%</span>
            <span class="count">{{ steps.other }}</span>
            <span class="label">Others</span>
        </li>
    </ul>
</div>
`;

const FEATURES_TEMPLATE = `
{{#features.length}}
    <ul class="collapse-list features">
        {{#features}}
            <li class="feature has-children">
                <button role="button" class="status status-{{status.type}}" data-toggle="collapse" aria-controls="scenarios-{{id}}" aria-expanded="false">{{name}}</button>
                    
                <ul class="{{#scenarios.length}}collapse-list {{/scenarios.length}} scenarios" id="scenarios-{{id}}">
                    {{#scenarios}}
                        <li class="scenario has-children">
                            <button role="button" class="status status-{{status.type}}" data-toggle="collapse" aria-controls="steps-{{id}}" aria-expanded="false">{{name}}</button>
                
                            <ul class="steps" id="steps-{{id}}">
                                {{#steps}}
                                    <li class="step {{type}}">
                                        <span class="status status-bg status-{{status.type}}">
                                            <span class="keyword">{{keyword}}</span> <span>{{text}}</span>
                                        </span>
                                    </li>
                                {{/steps}}
                                {{^steps.length}}
                                    <li>
                                        <mark>No steps defined</mark>
                                    </li>
                                {{/steps.length}}
                            </ul>
                        </li>
                    {{/scenarios}}
                
                    {{^scenarios.length}}
                        <li>
                            <mark>No scenarios defined</mark>
                        </li>
                    {{/scenarios.length}}
                </ul>
            </li>
        {{/features}}
    </ul>
{{/features.length}}`;

const PARTIALS = { };