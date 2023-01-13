(() => {
    document.querySelectorAll('div[data-fullscreen]').forEach(container => {
        const buttons = container.querySelectorAll('[data-toggle="fullscreen"]');
        buttons.forEach(button => {
            button.onclick = (event) => {
                event.preventDefault();
                const show = container.getAttribute('data-fullscreen') === 'true';
                container.setAttribute('data-fullscreen', !show);
                buttons.forEach(
                    button => button.setAttribute('title', show ? 'Maximize' : 'Close')
                );

                if (!show) {
                    container.dispatchEvent(new Event('openfullscreen'));
                    console.log('dispatchEvent', 'openfullscreen');
                } else {
                    container.dispatchEvent(new Event('closefullscreen'));
                    console.log('dispatchEvent', 'closefullscreen');
                }

                window.dispatchEvent(new Event('resize'));
            };
        })
    });
})();
