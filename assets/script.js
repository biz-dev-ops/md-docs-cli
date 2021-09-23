function __init(root, git) {        
    let base_url = new URL(`${root}`, window.location.href).href;
    if(base_url.endsWith("index.html")) {
        base_url = base_url.substr(0, base_url.lastIndexOf("index.html"));
    }

    const path = window.location.href.substr(base_url.length);
    const root_url = git.is_feature_branch ? new URL(`../`, base_url).href : base_url;

    const menu = document.getElementById("git-branch-menu");    
    menu
        .onclick = async () => {
            const items_el = document.getElementById("git-branch-menu-items");
            if(items_el != undefined) {
                items_el.style.visibility = items_el.style.visibility == "visible" ? "hidden" : "visible";
                return;
            }

            menu.classList.add("loading");

            const branches = await getBranches(`${root_url}branches.json`) ?? git.branches;

            const ul = document.createElement("ul");
            ul.id = "git-branch-menu-items";

            for (let branch of branches) {
                branch.base_url = `${root_url}${branch.path}`;
                branch.url = `${branch.base_url}${path}`;
                branch.url_exists = await urlExists(branch.url);

                const li = document.createElement("li");
                
                const a = document.createElement("a");
                a.href = branch.url_exists ? branch.url : `${branch.base_url}index.html`;
                a.innerText = branch.name;

                li.appendChild(a);
                
                ul.appendChild(li);
            }

            menu.appendChild(ul);
            
            menu.classList.remove("loading");
        };
};

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

async function getBranches(url) {
    try {
        const response = await fetch(url);
        const json = await response.json();
        return json;
    }
    catch {
        return null
    }
}