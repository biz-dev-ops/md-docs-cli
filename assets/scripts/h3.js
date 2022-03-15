(() => {
    for (const container of Array.from(document.getElementsByClassName("header-container h3"))) {
        const h3 = container.querySelector(':scope h3');
        h3.addEventListener("click", function () {
            Array.from(container.parentElement.children)
                .filter(c => c != container)
                .forEach((c) => c.classList.remove('active'));
            
            container.classList.toggle('active');
        });
    };
})();