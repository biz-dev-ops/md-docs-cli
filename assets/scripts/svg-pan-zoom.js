(() => {
  document.querySelectorAll('div[data-fullscreen] figure svg, div[data-fullscreen] figure embed').forEach(panZoomElement => {
    const fullscreenContainer = panZoomElement.closest('[data-fullscreen]');
    const zoomButtons = fullscreenContainer.querySelectorAll('[data-figure-zoom]');
    let panZoom;

    const handleZoom = event => {
      if (!panZoom) {
        return;
      }

      switch (event.currentTarget.dataset.figureZoom) {
        case 'in':
          panZoom.zoomIn();
          break;

        case 'out':
          panZoom.zoomOut();
          break;

        default:
          panZoom.reset();
      }
    }

    fullscreenContainer.setAttribute('data-fullscreen-zoom', true);

    panZoomElement.addEventListener('load', function() {
      panZoom = svgPanZoom(panZoomElement);
      fullscreenContainer.dispatchEvent(new Event('closefullscreen'));
    });

    window.addEventListener('resize', () => {
      if (panZoom) {
        panZoom.resize();
        panZoom.fit();
        panZoom.center();
      }
    });

    fullscreenContainer.addEventListener('openfullscreen', () => {
      if (panZoom) {
        panZoomElement.style.removeProperty('pointer-events');
        panZoom.resize();
        panZoom.fit();
        panZoom.center();
        panZoom.enablePan(); 
        panZoom.enableZoom();
        panZoom.enableDblClickZoom();
        panZoom.enableMouseWheelZoom();
      }
    });

    fullscreenContainer.addEventListener('closefullscreen', () => {
      if (panZoom) {
        panZoom.resize();
        panZoom.fit();
        panZoom.center();
        panZoom.disablePan();
        panZoom.disableZoom();
        panZoom.disableDblClickZoom();
        panZoom.disableMouseWheelZoom();
      }
    });

    zoomButtons.forEach(button => {
      button.addEventListener('click', handleZoom);
    });
  });
})();
