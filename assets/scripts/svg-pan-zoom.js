(() => {
  let panZoom = null;

  function onOpenFullscreen(e) {
    const container = e.currentTarget;
    makeItFit(container.querySelector('svg'));

    container.addEventListener('closefullscreen', onCloseFullscreen);
    container.querySelectorAll('[data-figure-zoom]').forEach(button => button.addEventListener('click', onZoomButtonClick));
    container.setAttribute('data-fullscreen-zoom', true);
  };

  function onCloseFullscreen(e) {
    const container = e.currentTarget;
    
    makeItFit(container.querySelector('svg'));

    container.removeAttribute('data-fullscreen-zoom');
    container.removeEventListener('closefullscreen', onCloseFullscreen);
    container.querySelectorAll('[data-figure-zoom]').forEach(button => button.removeEventListener('click', onZoomButtonClick));
  }

  function onZoomButtonClick(event) {
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

  function makeItFit(svg) {
    if(!panZoom) {
      panZoom = svgPanZoom(svg);
    }
    panZoom.resize();
    panZoom.fit();
    panZoom.center();
  }

  document.querySelectorAll(':is(div[data-fullscreen]):has(figure svg)').forEach(container => {
    container.addEventListener('openfullscreen', onOpenFullscreen);
    
    if(!container.offsetParent) {
      return;
    }

    makeItFit(container.querySelector('svg'));
    panZoom.destroy();
    panZoom = null;
  });

  window.addEventListener("ariaExpanded", (event) => {
    const container = event.detail.target;
    const svg = container.querySelector('div[data-fullscreen] svg');
    if(!svg) {
      return;
    }

    const bbox = svg.getBBox();
    if(bbox.height === 0 && bbox.width === 0) {
      return;
    }

    makeItFit(svg);
    panZoom.destroy();
    panZoom = null;
  });
})();
