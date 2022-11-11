(() => {
    document.querySelectorAll('.menu-toggle').forEach(el => {
        el.onclick = (event) => {
            event.preventDefault();
            
            const controls = el.getAttribute('aria-controls');
            const target = controls === 'next-sibling' ? el.nextSibling : document.getElementById(controls);
            const visible = el.getAttribute('aria-expanded') === 'true';

            if (visible) {
                el.removeAttribute('aria-expanded');
                target.setAttribute('hidden', 'true');
            }
            else {
                el.setAttribute('aria-expanded', 'true');
                target.removeAttribute('hidden');
            }
        }
    });
})();
