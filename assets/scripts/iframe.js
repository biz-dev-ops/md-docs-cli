(() => {
    const resizedCollection = iFrameResize({}, "iframe");

    if(resizedCollection.length > 0) {
        window.addEventListener("ariaExpanded", (event) => {
            const container = event.detail.target;
            const iframe = container.querySelector("iframe");
            if(!iframe.iFrameResizer) {
                return;
            }
            
            iframe.iFrameResizer.resize();
        });
    }
})();