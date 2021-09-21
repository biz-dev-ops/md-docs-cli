function useOctokit(Octokit, root, git) {        
    const octokit = new Octokit();

    let base_url = new URL(`${root}`, window.location.href).href;
    if(base_url.endsWith("index.html")) {
        base_url = base_url.substr(0, base_url.lastIndexOf("index.html"));
    }

    const path = window.location.href.substr(base_url.length);
    const root_url = git.is_feature_branch ? new URL(`../`, base_url).href : base_url;

    const menu = document.getElementById("git_branch_menu");    
    menu
        .onclick = async () => {
            const items_el = document.getElementById("git_branch_menu_items");
            if(items_el != undefined) {
                items_el.style.visibility = items_el.style.visibility == "visible" ? "hidden" : "visible";
                return;
            }

            menu.classList.add("loading");

            const branches = await octokit.request(`GET /repos/${git.repository}/branches`);

            const ul = document.createElement("ul");
            ul.id = "git_branch_menu_items";

            for (let branch of branches.data) {
                branch.is_main_branch = branch.name === git.main_branch;
                branch.base_url = `${root_url}${branch.is_main_branch ? "" : featureBranchToPath(branch.name) + "/"}`;
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

const urlExists = url => new Promise((resolve) => {
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
});

function featureBranchToPath(branch) {
    return "x-" + branch
        .replace("/", "-")
        .replace(" ", "-")
        .toLowerCase();
};