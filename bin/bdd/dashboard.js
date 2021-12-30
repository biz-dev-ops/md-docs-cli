const Mustache = require('mustache');

exports.render = (summary) => {
    return Mustache.render(TEMPLATE, summary, PARTIALS);    
}

const TEMPLATE = `<ul class="scenarios">    
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