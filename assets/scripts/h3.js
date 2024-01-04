(() => {
    for (const container of Array.from(document.querySelectorAll(".header-container.h3"))) {
        const h3 = container.querySelector('h3');
        h3.setAttribute('tabindex', '0');
        h3.setAttribute('role', 'button');

        h3.addEventListener("click", function () {
            container.classList.toggle('active');
        });

        h3.addEventListener("show", function () {
            container.classList.add('active');
        });
    };

    onHashChange = function(event) {
        const hash = window.location.hash?.substring(1);
        const el = document.getElementById(hash);
        el?.dispatchEvent(new Event("show"));
    }

    window.onhashchange = onHashChange;
    onHashChange();
})();