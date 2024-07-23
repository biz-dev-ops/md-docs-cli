(() => {
    function onOpenFullscreen(e) {
        const container = e.currentTarget;
        const viewer = container.querySelector("pdfjs-viewer-element");
        const app = viewer.iframe?.contentWindow?.PDFViewerApplication;
        
        app.eventBus.dispatch("switchscrollmode", { source: viewer, mode: 0 });

        toggleClass(viewer);
    }

    function onCloseFullscreen(e) {
        const container = e.currentTarget;
        const viewer = container.querySelector("pdfjs-viewer-element");
        const app = viewer.iframe?.contentWindow?.PDFViewerApplication;
        
        app.eventBus.dispatch("switchscrollmode", { source: viewer, mode: 1 });
        app.eventBus.dispatch("scalechanged", { source: viewer, value: "page-fit" });
        app.eventBus.dispatch("switchspreadmode", { source: viewer, mode: 0 });

        toggleClass(viewer);
    }

    function toggleClass(viewer) {
        viewer.iframe.contentWindow.document.body.classList.toggle("not-fullscreen");
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
                viewerApp.eventBus.dispatch("scalechanged", { source: this, value: "page-fit" });
                viewerApp.eventBus.dispatch("switchspreadmode", { source: this, mode: 0 });

                viewerApp.open({ 
                    data: Uint8Array.from(atob(data), (m) => m.codePointAt(0))
                });
                toggleClass(viewer, true);
            }
        });
    });
})();