(() => {
    function onOpenFullscreen(e) {
        const container = e.currentTarget;
        const viewer = container.querySelector("pdfjs-viewer-element");
        const app = viewer.iframe?.contentWindow?.PDFViewerApplication;
        
        app.eventBus.dispatch("switchscrollmode", { source: viewer, mode: 0 });
    }

    function onCloseFullscreen(e) {
        const container = e.currentTarget;
        const viewer = container.querySelector("pdfjs-viewer-element");
        const app = viewer.iframe?.contentWindow?.PDFViewerApplication;
        
        app.eventBus.dispatch("switchscrollmode", { source: viewer, mode: 1 });
    }

    document.addEventListener('DOMContentLoaded', async () => {
        document.querySelectorAll("pdfjs-viewer-element").forEach(async function (viewer) {
            const container = viewer.closest("[data-fullscreen]");
            container.addEventListener('openfullscreen', onOpenFullscreen);
            container.addEventListener('closefullscreen', onCloseFullscreen);

            const data = viewer.getAttribute("data");
            if (data) {
                const viewerApp = await viewer.initialize();

                viewerApp.eventBus.dispatch("switchscrollmode", { source: this, mode: 1 });

                viewerApp.open({ 
                    data: Uint8Array.from(atob(data), (m) => m.codePointAt(0))
                });
            }
        })
    });
})();