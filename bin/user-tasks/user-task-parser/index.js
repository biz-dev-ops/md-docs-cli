const formParser = require('../user-task-parser');

exports.parse = function (schema) {
    return {};
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