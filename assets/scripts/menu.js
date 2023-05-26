(() => {
    // Menu toggles
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

    // Menu list search
    document.querySelectorAll('input.list-search').forEach(searchInput => {
        const listId = searchInput.getAttribute('aria-controls');
        const list = document.getElementById(listId);
        const listClone = list.cloneNode(true);
        const links = [];
        let results = [];

        const noResults = document.createElement('li');
    
        noResults.classList.add('search-no-results');
        noResults.innerHTML = 'Geen resultaten';

        list.querySelectorAll('a').forEach(a => {
            const listItem = document.createElement('li');
            listItem.appendChild(a.cloneNode(true));
            links.push(listItem)
        })

        searchInput.addEventListener('input', (event) => {
            const query = event.target.value.trim().toLowerCase();
            results = [];
    
            links.forEach(item => {
                if (query.length > 0 && item.textContent.toLowerCase().includes(query)) {
                    results.push(item)
                }
            });

            // Empty list
            list.innerHTML = '';
            
            if (query.length > 0) {
                if (results.length > 0) {
                    // Show results
                    results.forEach(result => {
                        const li = document.createElement('li');
                        li.appendChild(result);
                        list.appendChild(li);
                    });
                } else {
                    // Nothing found
                    console.log('Nothing found');
                    list.appendChild(noResults.cloneNode(true));
                }
            } else {
                // Reset original list
                listClone.childNodes.forEach(li => {
                    list.appendChild(li.cloneNode(true));
                });
            }
        });
    })

    // function removeAllChildNodes(parent) {
    //     while (parent.firstChild) {
    //         parent.removeChild(parent.firstChild);
    //     }
    // }

    // const branchesSearch = document.querySelector('[name="menu-branches-search"]');
    // const branchesList = document.querySelector('#menu-branches ul');
    // const branchesNoResults = document.createElement('li');
    
    // branchesNoResults.classList.add('no-results');
    // branchesNoResults.setAttribute('hidden', true);
    // branchesNoResults.insertAdjacentHTML('beforeend', '<mark>Geen resultaten</mark>');
    // branchesList.appendChild(branchesNoResults);

    // branchesSearch.addEventListener('input', (event) => {
    //     const query = event.target.value.trim();

    //     branchesList.querySelectorAll('li').forEach(item => {
    //         if (item.textContent.includes(query)) {
    //             item.removeAttribute('hidden');
    //         } else {
    //             item.setAttribute('hidden', true);
    //         }
    //     });

    //     if (branchesList.querySelectorAll('li:not(.no-results):not([hidden])').length === 0) {
    //         branchesNoResults.removeAttribute('hidden');
    //     } else {
    //         branchesNoResults.setAttribute('hidden', true);
    //     }
    // });
})();
