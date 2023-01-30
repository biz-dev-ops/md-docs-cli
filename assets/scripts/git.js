(() => {
    const menu = document.getElementById('menu-branches');
    if (!menu)
        return;

    const ul = document.createElement("ul");

    window.x_md_docs_cli_branches.forEach(branch => {
        const li = document.createElement("li");

        const a = document.createElement("a");
        a.href = window.x_md_docs_cli_basePath + branch.path;
        a.text = branch.name;

        li.appendChild(a);
        ul.appendChild(li);
    });
    
    menu.appendChild(ul);
})();