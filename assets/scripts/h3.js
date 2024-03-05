(() => {
    for (const header of Array.from(document.querySelectorAll(".header-container h3, .header-container h4"))) {
        const container = header.closest(".header-container");
        header.setAttribute("tabindex", "0");
        header.setAttribute("role", "button");

        header.addEventListener("click", function () {
            container.classList.toggle("active");
            onChange(container);
        });

        header.addEventListener("show", function () {
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