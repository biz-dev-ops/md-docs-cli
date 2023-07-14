(() => {
    const ul = document.getElementById("list-branches");
    if (!ul)
        return;

    window.x_md_docs_cli_branches.forEach(branch => {
        const li = document.createElement("li");
        if(branch.name === window.x_md_docs_cli_branch)
            li.classList.add("active");

        const a = document.createElement("a");
        a.href = window.x_md_docs_cli_basePath + branch.path;
        a.setAttribute("data-branch-url", a.href);
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