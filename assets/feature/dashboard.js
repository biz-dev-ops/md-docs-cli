function __init(schema) {
    const data = Parser.parse(schema.features, schema.executions);

    console.log(schema);
    console.log(data);

    const percentageOf = (value, total) => {
        return Math.round(value / total * 1000) / 10;
    }

    const html = Mustache.render(TEMPLATE, data.summary, PARTIALS);

    document.body.insertAdjacentHTML("beforeend", html);

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
</div>`;

const PARTIALS = { };