const jsdom = require('jsdom');

module.exports = class HtmlParser {
    constructor() { }

    _replace(element, fragment) {
        if (typeof fragment === 'string')
            fragment = jsdom.JSDOM.fragment(fragment);

        let ref = element;
        let parent = ref.parentNode;

        if (parent.nodeName === 'P') {
            ref = parent;
            parent = ref.parentNode;
        }

        parent.insertBefore(fragment, ref);

        element.classList.add('replaced');
    }
}