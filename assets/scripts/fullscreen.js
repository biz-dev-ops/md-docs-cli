(() => {
    document.querySelectorAll('div[data-fullscreen=data-fullscreen]').forEach(container => {
        const buttons = [container.querySelector(':scope > header > button'), container.querySelector(':scope > footer > button')];
        buttons.forEach(button => {
            button.onclick = (event) => {
                event.preventDefault();
                const show = container.getAttribute('data-fullscreen') === 'true';
                container.setAttribute('data-fullscreen', !show);
                buttons.forEach(
                    button => button.setAttribute('title', show ? 'Maximize' : 'Close')
                );

                window.dispatchEvent(new Event('resize'));
            };
        })
    });
})();