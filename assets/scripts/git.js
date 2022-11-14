(() => {
    const urlExists = url => new Promise((resolve, reject) => {
        try {
            let request = new XMLHttpRequest;
            request.open('GET', url, true);
            request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            request.setRequestHeader('Accept', '*/*');
            request.onerror = () => {
                resolve(false);
            };
            request.onprogress = (event) => {
                let status = event.target.status;
                let statusFirstNumber = (status).toString()[0];
                switch (statusFirstNumber) {
                    case '2':
                        request.abort();
                        resolve(true);
                    case '3':
                        request.abort();
                        resolve(true);
                    default:
                        request.abort();
                        resolve(false);
                };
            };
    
            request.send('');
        }
        catch(ex) {
            reject(ex);
        }
    });

    const menu = document.getElementById('menu-branches');
    if (!menu)
        return;
        
    menu.querySelectorAll('a').forEach(anchor => {
        anchor.onclick = async (event) => {
            if ((await urlExists(anchor.href))) {
                return;
            }

            event.preventDefault();
            window.location.href = anchor.getAttribute('data-branch-url');
        }
    });
})();



