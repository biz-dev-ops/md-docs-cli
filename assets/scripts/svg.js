(() => {
    const menu = document.getElementById('menu-main');
    const processSVG = function(svg) {
        svg.querySelectorAll('div,text').forEach(el => {
            const id = getId(el);

            const anchor = document.getElementById(id);
            const page = menu.querySelector(`a[href$="/${id}/index.html"], a[href="${id}/index.html"]`);

            if(anchor || page) {
                el.style.textDecoration = "underline";

                el.onmouseenter = (e) => {
                    e.target.style.cursor = 'pointer';
                }
                el.onmouseleave = (e) => {
                    e.target.style.cursor = 'auto';
                }
                
                el.onclick = (e) => {
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

    const getId = function(el) {
        let id = null;
        if(el.tagName === "text") {
            //Bug fix for missing space in BPMN to SVG
            id = Array.from(el.children)
                .map(c => c.textContent?.trim())
                .join(" ");
        } 
        else {
            id = el.textContent;
        }
        
        return id 
            .trim()
            .toLowerCase()
            .replaceAll(' ', '-')
            .replaceAll('\n', '-')
    };

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