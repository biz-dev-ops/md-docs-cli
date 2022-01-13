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

    document.getElementById('git-branch-menu').querySelectorAll('a').forEach(anchor => {
        anchor.onclick = async (event) => {
            event.preventDefault();
            if ((await urlExists(anchor.href)) === false) {
                window.location.href = anchor.getAttribute('data-branch-url');
            }
        }
    });
})();


