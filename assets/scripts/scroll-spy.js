(() => {
    const links = document.querySelectorAll(".table-of-content a");
    const anchors = document.querySelectorAll(".header-container h2");
    let activeAnchorId = null;

    const scrollspy = () => {
        const pageYPosition = document.documentElement.scrollTop || document.body.scrollTop;
        let newActiveAnchorId;

        for(const anchor of anchors) {
            if (anchor.offsetTop - pageYPosition > 120) {
                newActiveAnchorId = anchor.id;
                break;
            }
        }

        if (newActiveAnchorId !== activeAnchorId) {
            activeAnchorId = newActiveAnchorId;

            links.forEach((link) => {
                if (link.hash === "#" + newActiveAnchorId) {
                    link.parentElement.setAttribute('class', 'active');
                } else {
                    link.parentElement.removeAttribute('class');
                }
            });
        }
    };

    window.addEventListener('scroll', scrollspy);
    window.addEventListener('load', scrollspy);
    window.addEventListener('resize', scrollspy);

    scrollspy();
})();
