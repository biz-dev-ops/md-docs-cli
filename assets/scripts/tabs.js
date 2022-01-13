(() => {
    document.querySelectorAll('.tabs-container').forEach((container) => {
        const anchors = container.querySelectorAll(':scope .tabs-list-container a');
        const panels = container.querySelectorAll(':scope .tabs-panels-container > div');

        anchors.forEach((anchor, index) => {
            anchor.onclick = (event) => {
                event.preventDefault();

                anchors.forEach(sibling => sibling.removeAttribute('aria-expanded'));
                anchor.setAttribute('aria-expanded', 'true');
            
                panels.forEach(sibling => sibling.setAttribute('hidden', 'true'));
                panels[index].removeAttribute('hidden');
            };
        })
    })
})();