(() => {
    for (const container of Array.from(document.querySelectorAll(".header-container.h3"))) {
        const h3 = container.querySelector("h3");
        h3.setAttribute("tabindex", "0");
        h3.setAttribute("role", "button");

        h3.addEventListener("click", function () {
            container.classList.toggle("active");
            onChange(container);
        });

        h3.addEventListener("show", function () {
            container.classList.add("active");
            onChange(container);
        });
    };

    onChange = function(container) {
        if(container.classList.contains("active")) {
            var event = new CustomEvent('ariaExpanded', {
                detail: {
                    target: container
                }
            });
            
            window.dispatchEvent(event); 
        }
    }

    onHashChange = function(event) {
        const hash = window.location.hash?.substring(1);
        const el = document.getElementById(hash);
        el?.dispatchEvent(new Event("show"));
    }

    window.onhashchange = onHashChange;
    onHashChange();
})();