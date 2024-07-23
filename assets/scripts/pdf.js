(() => {
    document.querySelectorAll("iframe.letter.pdf").forEach(el => {
        const footer = el.closest("[data-fullscreen]").querySelector("footer");

        const anchor = document.createElement("a");
        anchor.innerText = "PDF";
        anchor.title = "PDF";
        anchor.className = "button pdf";
        anchor.href = el.getAttribute("src").replace(".html", ".pdf");

        footer.appendChild(anchor);
    });
})();