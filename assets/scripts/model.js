(() => {
    document.querySelectorAll('.json-toggle').forEach(el => {
        el.onclick = (event) => {
            event.preventDefault();

            event.target.nextElementSibling.toggleAttribute("hidden");
        }
    });
})();