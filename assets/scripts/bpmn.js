(() => {
    document.querySelectorAll('div.bpmn').forEach(container => {

        const viewer = new BpmnJS({
            container: container
        });

        viewer.importXML(container.getAttribute("data-xml"))
            .then(() => {
                const viewbox = viewer.get('canvas').viewbox();
                if(viewbox.height > 0 && viewbox.width > 0) {
                    viewer.get('canvas').zoom('fit-viewport', 'auto');
                }
                else {
                    //@Sander wat hier te doen?
                }

                const eventBus = viewer.get('eventBus');
                const menu = document.getElementById('menu-main');

                let anchor = null;
                let page = null;

                eventBus.on('element.hover', function(e) {
                    if(!e.element?.businessObject?.name)
                    return;

                    const id = e.element.businessObject.name
                        .trim()
                        .toLowerCase()
                        .replaceAll(' ', '-');

                    anchor = document.getElementById(id);
                    page = menu.querySelector(`a[href$="/${id}/index.html"], a[href="${id}/index.html"]`);

                    if(anchor || page) {
                    e.gfx.style.cursor = 'pointer';
                    }
                });

                eventBus.on('element.out', function(e) {
                    e.gfx.style.cursor = 'auto';
                    anchor = null;
                    page = null;
                });

                eventBus.on('element.click', function(e) {
                    if(anchor) {
                        anchor.click();
                        anchor.scrollIntoView();
                    }
                    
                    if(page) {
                        window.location.href = page;
                    }
                });
            })
            .catch(error => {
                console.error('Error rendering bpmn file: #{file}', error);
            });

        viewer.get('zoomScroll').toggle(false);

        const fullscreenContainer = container.closest('[data-fullscreen]');
        fullscreenContainer.setAttribute('data-fullscreen-zoom', true);
        fullscreenContainer.querySelectorAll('[data-figure-zoom]').forEach(button => {
            button.addEventListener('click', event => {
                const z =  viewer.get('canvas').zoom();
        
                switch (event.currentTarget.dataset.figureZoom) {
                    case 'in':
                        viewer.get('canvas').zoom(z + .5, 'auto');
                    break;
        
                    case 'out':
                        viewer.get('canvas').zoom(z - .5, 'auto');
                    break;
        
                    default:
                        viewer.get('canvas').zoom('fit-viewport', 'auto');
                }
            });
        });
    
        fullscreenContainer.addEventListener('openfullscreen', () => {
            viewer.get('canvas').zoom('fit-viewport', 'auto');
            setTimeout(() => {
                viewer.get('canvas').zoom('fit-viewport', 'auto');
            }, 1);
            viewer.get('zoomScroll').toggle();
            
        });
            
        fullscreenContainer.addEventListener('closefullscreen', () => {
            viewer.get('canvas').zoom('fit-viewport', 'auto');
            setTimeout(() => {
                viewer.get('canvas').zoom('fit-viewport', 'auto');
            }, 1);
            viewer.get('zoomScroll').toggle();
        });    
    });
})();