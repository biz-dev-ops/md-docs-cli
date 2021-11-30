function __init(schema) {
    let data = transformToMustacheData(schema);

    const html = (() => {
        if (data.model == undefined && data.actions.length === 1)
            return Mustache.render(TEMPLATE, { data: data.actions[0] }, PARTIALS);
        else
            return Mustache.render(TEMPLATE, { data: data }, PARTIALS);
    })();

    document.body.insertAdjacentHTML("beforeend", html);

    const actionList = document.querySelector('.action-list');
    if (actionList == undefined)
        return;
    
    const actions = actionList.querySelectorAll('button');
    const actionCards = [];

    const hide = (el) => {
        el.setAttribute('hidden', 'hidden');
    }

    const show = (el) => {
        el.removeAttribute('hidden');
    }

    actions.forEach(action => {
        const targetId = action.getAttribute('aria-controls');
        const target = document.getElementById(targetId);

        actionCards.push(target);

        action.onclick = event => {
            show(target);
            hide(actionList);
        }
    })

    const closeActionCard = (card) => {
        show(actionList);
        hide(card);
    }

    actionCards.forEach(card => {
        const form = card.querySelector('form');
        const submit = card.querySelector('[type="submit"]');
        const cancel = card.querySelector('[data-cancel]');

        submit.onclick = () => {
            const confirmText = submit.getAttribute("data-confirm");

            if (form.checkValidity()) {
                if (window.confirm(confirmText || "")) {
                    closeActionCard(card);
                }
            }
        }

        cancel.onclick = () => {
            closeActionCard(card);
        }
    });
}

function transformToMustacheData(data) {
    return {
        model: transformToUserTask(data),
        actions: transformToActions(data)
    };
}

function transformToUserTask(data) {
    const d = data["user-task"];
    if (d == undefined)
        return null;
    
    return {
        name: d.name,
        items: transformToFields(d.schema)
    };
}

function transformToFields(schema) {
    const fields = [];

    for (var key in schema.properties) {
        if (key == "user_task" || key == "command")
            continue;
        
        const property = schema.properties[key];
        let field = {
            id: key,
            name: key,
            label: property.title ?? key,
            description: property.description,
            has_items: false,
            items: null,
            has_value: false,
            value: null
        }

        if (property.type == "object") {
            field.has_items = true;
            field.items = transformToFields(property);
        }
        else {
            field.has_value = true;
            field.value = transformToField(property);
        }

        fields.push(field);
    }

    return fields;
}

function transformToField(property) {
    return property.example;
}

function transformToActions(data) {
    return Object.entries(data.actions)
        .map(kvp => transformToAction(kvp[0], kvp[1]));
}

function transformToAction(key, action) {
    return {
        id: key,
        label: action.name ?? key,
        items: transformToFormFields(action.schema)
    }    
}

function transformToFormFields(schema) {
    return Object.entries(schema.properties)
        .filter(kvp => kvp[0] != "user_task" && kvp[0] != "command")
        .map(kvp => {
            const key = kvp[0];
            const property = kvp[1];

            let field = {
                id: key,
                name: key,
                label: property.title ?? key,
                description: property.description,
                required: schema.required != undefined ? schema.required.includes(key) : false,            
                value: property.example,
                has_items: false,
                items: null,
                has_editor: false,
                editor: null
            }

            if (property.type == "object") {
                field.has_items = true;
                field.items = transformToFormFields(property);
            }
            else {
                field.has_editor = true;
                field.editor = parseFormField(property);
            }

            return field;        
        });
}

function parseFormField(property) {
    if (property.type === "boolean") {
        return {
            inputEditor: true,
            type: checkbox
        };
    }

    if (property.type === "number" || property.type === "integer") {
        return {
            inputEditor: true,
            type: number,
            format: property.format ?? false,
            minimum: property.format ?? false,
            maximum: property.format ?? false,
            multipleOf: property.format ?? false,
            maximum: property.format ?? false,
            exclusiveMinimum: property.format ?? false,
            exclusiveMaximum: property.format ?? false,
        };
    }

    if (property.type === "array") {
        //TODO        
    }

    if (property.type === "string") {
        var type = mapHtml5InpputType(property);
        if (type != undefined) {
            return {
                inputEditor: true,
                type: type,
                pattern: property.pattern ?? false
            }
        }
        
        switch (property.format)
        {
            case "text":
                return {
                    textAreaEditor: true,
                    rows: 5
                }
            case "markdown":
                return {
                    markdownEditor: true,
                    rows: 5
                }
            default:
                return {
                    inputEditor: true,
                    type: "text",
                    format: property.format ?? false,
                    pattern: property.pattern ?? false,
                };
        }
    }
}

function mapHtml5InpputType(property) {
    let format = mapFormat(property.format);

    if (format == undefined)
        return null;
    
    if (!HTML5_TYPES.includes(format))
        return null;
    
    return format;
}

function mapFormat(format) {
    if (format == undefined)
        return null;
    
    return OPENAPI_HTML5_MAPPING[format];
}

const OPENAPI_HTML5_MAPPING = {
    "date-time": "datetime-local"
};

const HTML5_TYPES = ["color", "date", "datetime-local", "email", "month", "range", "tel", "time", "url", "week"];

const TEMPLATE = `<section class="app card">
{{#data}}
    {{#model}}
        <h2>{{name}}</h2>
        
        {{> fieldItems }}        

        <section class="action-list">
            <div class="form-submit">
                {{#data.actions}}
                <button aria-controls="action-{{id}}">{{label}}</button>
                {{/data.actions}}
            </div>
        </section>

        {{#actions}}
        <section class="action card" id="action-{{id}}" hidden="hidden">
            <h2>{{label}}</h2>
            
            <p>{{description}}</p>

            <form action="#" type="post">
                {{> formItems }}
                
                <div class="form-submit">
                    <button type="button" data-cancel aria-controls="action-{{id}}">Cancel</button>
                    <button type="submit" data-confirm="Are you sure you want to complete this user task with {{name}}?">Submit</button>
                </div>
            </form>
        </section>
        {{/actions}}
    {{/model}}
    {{^model}}
        <h2>{{label}}</h2>
        
        <p>{{description}}</p>

        <form action="#" type="post">
            {{> formItems }}
            <div class="form-submit">
                <button type="button" data-cancel aria-controls="action-{{id}}">Cancel</button>
                <button type="submit" data-confirm="Are you sure you want to complete this user task with {{name}}?">Submit</button>
            </div>
        </form>
    {{/model}}
{{/data}}
</section>`;

const PARTIALS = {
    fieldItems: `<dl>    
        {{#items}}
        {{> fieldItem}}
        {{/items}}
    </dl>`,
    fieldItem: `<dt>{{label}}</dt>
    <dd>
        {{#has_value}}
        {{value}}
        {{/has_value}}
        {{#has_items}}
        {{> fieldItems}}
        {{/has_items}}
    </dd>`,
    formItems: `{{#items}}
        {{> formItem}}    
    {{/items}}`,
    formItem: `<div class="form-item">
        <label for="{{id}}" class="{{#required}}required{{/required}}">{{label}}</label>
        <div class="input-group">
            {{#has_items}}
                {{> formItems}}
            {{/has_items}}

            {{#has_editor}}           
                {{#editor}}
                    {{#inputEditor}}
                    <input type="{{type}}" name="{{name}}" id="{{id}}" value="{{value}}" {{#required}}required{{/required}} />    
                    {{/inputEditor}}

                    {{#textAreaEditor}}
                    <textarea name="{{name}}" id="{{id}}" rows="{{rows}}" {{#required}}required{{/required}}>{{value}}</textarea>
                    {{/textAreaEditor}}

                    {{#markdownEditor}}
                    <textarea name="{{name}}" id="{{id}}" rows="{{rows}}" {{#required}}required{{/required}}>{{value}}</textarea>
                    {{/markdownEditor}}

                    {{#selectEditor}}
                    <select name="{name}" id="{{id}}">
                        <option {{^required}}disabled{{/required}} selected></option>
                        {{#options}}
                            <option value="{{value}}">{{name}}</option>
                        {{/options}}
                    </select>
                    {{/selectEditor}}
                    
                    {{#radioGroupEditor}}
                    {{^required}}
                    <div class="form-check">
                        <input type="radio" name="{{name}}" id="{{id}}" value="" />
                        <label for="{{id}}">None</label>
                    </div>
                    {{/required}}
                    {{#options}}
                    <div class="form-check">
                        <input type="radio" name="{{name}}" id="{{id}}" value="{{value}}" />
                        <label for="{{id}}">{{name}}</label>
                    </div>
                    {{/options}}
                    {{/radioGroupEditor}}

                    {{#checkboxGroupEditor}}
                    {{#options}}
                    <div class="form-check">
                        <input type="checkbox" name="{{name}}" id="{{id}}" value="{{value}}" />
                        <label for="{{id}}">{{name}}</label>
                    </div>
                    {{/options}}
                    {{/checkboxGroupEditor}}
                {{/editor}}
            {{/has_editor}}            
        </div>
        <div class="input-feedback"></div>
    </div>`
};