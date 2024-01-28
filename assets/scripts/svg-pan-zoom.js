(() => {
  let panZoom = null;

  function onOpenFullscreen(e) {
    const container = e.currentTarget;
    panZoom = svgPanZoom(container.querySelector('svg'));

    container.addEventListener('closefullscreen', onCloseFullscreen);
    container.querySelectorAll('[data-figure-zoom]').forEach(button => button.addEventListener('click', onZoomButtonClick));
    container.setAttribute('data-fullscreen-zoom', true);
  };

  function onCloseFullscreen(e) {
    const container = e.currentTarget;
    panZoom.resize();
    panZoom.fit();
    panZoom.center();
    panZoom.destroy();
    panZoom = null;

    container.removeAttribute('data-fullscreen-zoom');
    container.removeEventListener('closefullscreen', onCloseFullscreen);
    container.querySelectorAll('[data-figure-zoom]').forEach(button => button.removeEventListener('click', onZoomButtonClick));
  }

  function onZoomButtonClick() {
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

  document.querySelectorAll(':is(div[data-fullscreen]):has(figure svg)').forEach(element => element.addEventListener('openfullscreen', onOpenFullscreen));
})();
