function __init(root, git) {
    return;
    
    // Branches
    let base_url = new URL(`${root}`, window.location.href).href;
    if(base_url.endsWith("index.html")) {
        base_url = base_url.substr(0, base_url.lastIndexOf("index.html"));
    }

    const path = window.location.href.substr(base_url.length);
    const root_url = git.is_feature_branch ? base_url.substr(0, base_url.length - git.path.length) : base_url;

    const loadBranches = async (menu) => {
        menu.classList.add("loading");

        const branches = await getBranches(`${root_url}branches.json`) ?? git.branches;

        const ul = document.createElement("ul");

        for (let branch of branches) {
            branch.base_url = `${root_url}${branch.path === "" ? "" : branch.path + "/"}`;
            branch.url = `${branch.base_url}${path}`;
            branch.url_exists = await urlExists(branch.url);

            const li = document.createElement("li");

            const a = document.createElement("a");
            a.href = branch.url_exists ? branch.url : `${branch.base_url}index.html`;
            a.innerText = branch.name;

            li.appendChild(a);

            ul.appendChild(li);
        }

        menu.innerHTML = '';
        menu.appendChild(ul);

        menu.classList.remove("loading");
    };


    // Menu
    const toggleMenu = (button, expand) => {
        const menuId = button.hash;
        const target = document.querySelector(menuId);
        let expanded = button.getAttribute('aria-expanded') === 'true';

        if (typeof expand == "boolean") {
            expanded = !expand;
        }

        if (menuId === "#git-branch-menu") {
            loadBranches(target);
        }

        button.setAttribute('aria-expanded', !expanded);
        target.setAttribute('aria-hidden', expanded);

        return !expanded;
    }

    const menuToggleButtons = document.querySelectorAll(".menu-toggle");

    menuToggleButtons.forEach(btn => {
        btn
            .onclick = event => {
                const toggle = event.target.closest('a');
                const toggled = toggleMenu(toggle);

                if (toggled) {
                    const [sibling] = [...menuToggleButtons].filter(menuToggleButton => menuToggleButton !== toggle);
                    toggleMenu(sibling, false);
                }

                event.preventDefault();
            };
    });


    // Fullscreen containers
    const fsTitle = (isFullscreen) => {
        if (isFullscreen) {
            return 'Close';
        } else {
            return 'Maximize';
        }
    }
    const fsSources = document.querySelectorAll('[data-fullscreen]')
    const fsHeader = document.createElement('header');
    const fsFooter = document.createElement('footer');
    const fsButton = document.createElement('button');
    fsButton.setAttribute('type', 'button');
    fsButton.setAttribute('title', fsTitle(false));

    const fsButtonLabel = document.createElement('span');
    fsButtonLabel.classList.add('label');
    fsButtonLabel.textContent = "Zoom";

    fsButton.appendChild(fsButtonLabel);

    fsHeader.appendChild(fsButton.cloneNode(true));
    fsFooter.appendChild(fsButton.cloneNode(true));

    fsSources.forEach(fsSource => {
        fsSource.prepend(fsHeader.cloneNode(true));
        fsSource.append(fsFooter.cloneNode(true));

        fsSource.querySelectorAll('button').forEach(fsButton => {
            fsButton.onclick = () => {
                const show = fsSource.getAttribute('data-fullscreen') === 'true';
                fsSource.setAttribute('data-fullscreen', !show);

                fsSource.querySelectorAll('button').forEach(
                  button => button.setAttribute('title', fsTitle(!show))
                );

                // Trigger resize for BPMN.io container
                window.dispatchEvent(new Event('resize'));
            }
        });

    })

    // Scroll spy
    const links = document.querySelectorAll("#toc-container a");
    const anchors = document.querySelectorAll(".header-container h2, .header-container h3");

    window.onscroll = () => scrollspy();
    window.onload = () => scrollspy();
    window.onresize = () => scrollspy();

    const scrollspy = () => {
        const pageYPosition = document.documentElement.scrollTop || document.body.scrollTop;

        anchors.forEach((anchor) => {
            const anchorYPosition = anchor.offsetTop;

            if (pageYPosition > anchorYPosition - window.outerHeight + 210) {
                links.forEach((link) => {
                    if (link.hash === "#" + anchor.id) {
                        link.parentElement.setAttribute('class', 'active');
                    } else {
                        link.parentElement.removeAttribute('class');
                    }
                });
            }
        });
    };

    scrollspy();

    // Tabs
    const tabsContainers = document.querySelectorAll(".tabs-container");

    tabsContainers.forEach(container => {
        const tabs = container.querySelectorAll(".tabs-list-container a");
        const panels = container.querySelectorAll(".tabs-panels-container > *");

        const hideAllPanels = () => {
            panels.forEach(panel => panel.setAttribute('hidden', 'hidden'));    
        }

        const unSelectAllTabs = () => {
            tabs.forEach(tab => tab.setAttribute('aria-expanded', 'false'));    
        }
        
        hideAllPanels();
        panels[0].removeAttribute('hidden');

        tabs[0].setAttribute('aria-expanded', 'true');

        tabs.forEach(tab => {
            tab.onclick = event => {
                hideAllPanels();
                unSelectAllTabs();

                event.target.setAttribute('aria-expanded', 'true');
                document.querySelector(event.target.hash).removeAttribute('hidden');

                // Trigger resize for BPMN.io container
                window.dispatchEvent(new Event('resize'));

                event.preventDefault();
            }
        });
    })
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

iFrameResize({}, 'iframe');