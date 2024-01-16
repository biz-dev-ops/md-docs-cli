(() => {
    const ul = document.getElementById("list-branches");
    if (!ul)
        return;

    window.x_md_docs_cli_branches.forEach(branch => {
        const li = document.createElement("li");
        if(branch.name === window.x_md_docs_cli_branch)
            li.classList.add("active");

        const a = document.createElement("a");
        a.href =  `${x_md_docs_cli_root}${branch.path}`;
        a.setAttribute("title", branch.name);

        branch.name.split("/").forEach((slug, idx, array) => {
            const span = document.createElement("span");
            span.textContent = slug.concat((idx < (array.length - 1)) ? "/" : "");
            a.appendChild(span);
         });

        li.appendChild(a);
        ul.appendChild(li);
    });
})();