(() => {
    const nav = document.getElementById("table-of-content");
    let ul;
    Array.from(document.querySelectorAll(".header h2")).forEach(h2 => {
        if(!ul) {
            ul = document.createElement("ul");
            nav.appendChild(ul);
        }
        const li = document.createElement("li");

        const a = document.createElement("a");
        a.href = h2.querySelector("a").href;
        a.innerText = h2.innerText;

        li.appendChild(a);

        ul.appendChild(li);
    });
})();