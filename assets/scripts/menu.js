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

    const branchesSearch = document.querySelector('[name="menu-branches-search"]');
    const branchesList = document.querySelector('#menu-branches ul');
    const branchesNoResults = document.createElement('li');
    
    branchesNoResults.classList.add('no-results');
    branchesNoResults.setAttribute('hidden', true);
    branchesNoResults.insertAdjacentHTML('beforeend', '<mark>Geen resultaten</mark>');
    branchesList.appendChild(branchesNoResults);

    branchesSearch.addEventListener('input', (event) => {
        const query = event.target.value.trim();

        branchesList.querySelectorAll('li').forEach(item => {
            if (item.textContent.includes(query)) {
                item.removeAttribute('hidden');
            } else {
                item.setAttribute('hidden', true);
            }
        });

        if (branchesList.querySelectorAll('li:not(.no-results):not([hidden])').length === 0) {
            branchesNoResults.removeAttribute('hidden');
        } else {
            branchesNoResults.setAttribute('hidden', true);
        }
    });
})();
