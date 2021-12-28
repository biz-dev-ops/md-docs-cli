function __init(schema) {
    const data = Parser.parse(schema.features, schema.executions);

    const html = Mustache.render(TEMPLATE, { }, PARTIALS);

    document.body.insertAdjacentHTML("beforeend", html);
};

const TEMPLATE = `<h1>Todo</h1>`;

const PARTIALS = { };