(() => {
  function onOpenFullscreen(e) {
    const container = e.currentTarget;
    const bpmnViewer = container.querySelector('bpmn-viewer');
    bpmnViewer.zoomReset();

    container.addEventListener('closefullscreen', onCloseFullscreen);
    container.querySelectorAll('[data-figure-zoom]').forEach(button => button.addEventListener('click', onZoomButtonClick));
    container.setAttribute('data-fullscreen-zoom', true);

    setTimeout(() => {
      bpmnViewer.zoomReset();
    }, 1);
  };

  function onCloseFullscreen(e) {
    const container = e.currentTarget;
    const bpmnViewer = container.querySelector('bpmn-viewer');
    bpmnViewer.zoomReset();

    container.removeAttribute('data-fullscreen-zoom');
    container.removeEventListener('closefullscreen', onCloseFullscreen);
    container.querySelectorAll('[data-figure-zoom]').forEach(button => button.removeEventListener('click', onZoomButtonClick));

    setTimeout(() => {
      bpmnViewer.zoomReset();
    }, 1);
  }

  function onZoomButtonClick(event) {
    const container = event.currentTarget.closest(".container");
    const bpmnViewer = container.querySelector('bpmn-viewer');

    switch (event.currentTarget.dataset.figureZoom) {
      case 'in':
        bpmnViewer.zoomIn();
        break;

      case 'out':
        bpmnViewer.zoomOut();
        break;

      default:
        bpmnViewer.zoomReset();
        break;
    }
  }

  function onElementClick(event) {
    const links = event.detail.links;
    if(links?.length > 0) {
      window.location.assign(links[0].value);
    }

    //TODO: show menu when more than one links.
  }

  document.querySelectorAll(':is(div[data-fullscreen]):has(bpmn-viewer)').forEach(container => {
    container.addEventListener('openfullscreen', onOpenFullscreen);
    const bpmnViewer = container.querySelector('bpmn-viewer');
    bpmnViewer.addEventListener('onelementclick', onElementClick);
  });

  window.addEventListener("resize", (event) => {
    document.querySelectorAll('bpmn-viewer').forEach(bpmnViewer => {
      bpmnViewer.zoomReset();
    });
  });
})();
