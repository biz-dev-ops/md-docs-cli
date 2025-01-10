(() => {
  function onOpenFullscreen(e) {
    const container = e.currentTarget;
    const dmnViewer = container.querySelector('dmn-viewer');
    
    container.addEventListener('closefullscreen', onCloseFullscreen);

    dmnViewer.zoomReset();
    setTimeout(() => {
      dmnViewer.zoomReset();
    }, 1);
  };

  function onCloseFullscreen(e) {
    const container = e.currentTarget;
    const dmnViewer = container.querySelector('dmn-viewer');
    
    container.removeEventListener('closefullscreen', onCloseFullscreen);
    
    dmnViewer.zoomReset();
    setTimeout(() => {
      dmnViewer.zoomReset();
    }, 1);
  }

  document.querySelectorAll(':is(div[data-fullscreen]):has(dmn-viewer)').forEach(container => {
    container.addEventListener('openfullscreen', onOpenFullscreen);
  });

  window.addEventListener("resize", (event) => {
    document.querySelectorAll('dmn-viewer').forEach(dmnViewer => {
      dmnViewer.zoomReset();
    });
  });
})();
