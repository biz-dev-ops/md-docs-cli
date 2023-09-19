(() => {
    const menu = document.getElementById('menu-main');
    const processSVG = function(svg) {
        svg.querySelectorAll('div').forEach(div => {
            const id = div.innerText
                .trim()
                .toLowerCase()
                .replaceAll(' ', '-')
                .replaceAll('\n', '-');

            const anchor = document.getElementById(id);
            const page = menu.querySelector(`a[href$="/${id}/index.html"], a[href="${id}/index.html"]`);

            if(anchor || page) {
                div.style.textDecoration = "underline";

                div.onmouseenter = (e) => {
                    e.target.style.cursor = 'pointer';
                }
                div.onmouseleave = (e) => {
                    e.target.style.cursor = 'auto';
                }
                div.onclick = (e) => {
                    e.preventDefault()
                    if(anchor) {
                        anchor.click();
                        anchor.scrollIntoView();
                    }
                    
                    if(page) {
                        window.location.href = page;
                    }
                };
            }
        });
    }

    document.querySelectorAll('div.content embed[type="image/svg+xml"]').forEach(embed => {
        const svg = embed.getSVGDocument();
        if(svg) {
            processSVG(svg);
        }
        else {
            embed.onload = (e) => {
                processSVG(e.target.getSVGDocument());
            }
        }
    });
})();