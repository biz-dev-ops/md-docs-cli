(() => {
    const links = document.querySelectorAll("#toc-container a");
    const anchors = document.querySelectorAll(".header-container h2, .header-container h3");

    const scrollspy = () => {
        const pageYPosition = document.documentElement.scrollTop || document.body.scrollTop;

        anchors.forEach((anchor) => {
            const anchorYPosition = anchor.offsetTop;

            if (pageYPosition > anchorYPosition - window.outerHeight + 210) {
                links.forEach((link) => {
                    if (link.hash === "#" + anchor.id) {
                        link.parentElement.setAttribute('class', 'active');
                    } else {
                        link.parentElement.removeAttribute('class');
                    }
                });
            }
        });
    };

    window.onscroll = () => scrollspy();
    window.onload = () => scrollspy();
    window.onresize = () => scrollspy();

    scrollspy();
})();