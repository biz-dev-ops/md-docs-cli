(() => {
    for (const container of Array.from(document.querySelectorAll(".header-container.h3"))) {
        const h3 = container.querySelector('h3');
        h3.setAttribute('tabindex', '0');
        h3.setAttribute('role', 'button');

        h3.addEventListener("click", function () {
            container.classList.toggle('active');
        });

        h3.addEventListener("keydown", function () {
            if (event.key === "Enter") {
                container.classList.toggle('active');
            }
        });
    };
})();