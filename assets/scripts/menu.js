(() => {
    document.querySelectorAll('a.menu-toggle').forEach(anchor => {
        anchor.onclick = (event) => {
            event.preventDefault();
            
            const target = document.getElementById(anchor.hash.substring(1));
            const visible = anchor.getAttribute('aria-expanded') === 'true';

            if (visible) {
                anchor.removeAttribute('aria-expanded');
                target.setAttribute('hidden', 'true');
            }
            else {
                anchor.setAttribute('aria-expanded', 'true');
                target.removeAttribute('hidden');
            }
            
        }
    });
})();