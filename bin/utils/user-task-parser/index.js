exports.parse = function (schema) {
    const userTask = transformToUserTask(schema);
    const actions = transformToActions(schema);

    return { userTask, actions };
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
        const field = {
            id: key,
            name: key,
            label: property.title ?? key,
            description: property.description
        }

        if (property.type == "object") {
            field.items = transformToFields(property);
        }
        else {
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
        name: action.name ?? key,
        items: transformToFormFields(action.schema)
    }    
}

function transformToFormFields(schema) {
    return Object.entries(schema.properties)
        .filter(kvp => kvp[0] != "user_task" && kvp[0] != "command")
        .map(kvp => {
            const key = kvp[0];
            const property = kvp[1];

            const field = {
                id: key,
                name: key,
                label: property.title ?? key,
                description: property.description,
                required: schema.required != undefined ? schema.required.includes(key) : false,            
                value: property.example
            }

            if (property.type == "object") {
                field.items = transformToFormFields(property);
            }
            else {
                field.editor = parseFormField(property);
            }

            return field;        
        });
}

function parseFormField(property) {
    if (property.type === "boolean") {
        return {
            type: "input",
            inputType: checkbox
        };
    }

    if (property.type === "number" || property.type === "integer") {
        return {
            type: "input",
            inputType: number,
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
                type: "input",
                inputType: type,
                pattern: property.pattern ?? false
            }
        }
        
        switch (property.format)
        {
            case "text":
                return {
                    type: "textarea",
                    rows: 5
                }
            case "markdown":
                return {
                    type: "markdown",
                    rows: 5
                }
            default:
                return {
                    type: "input",
                    inputType: "text",
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