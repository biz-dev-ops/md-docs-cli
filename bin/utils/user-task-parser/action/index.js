const { v4: uuidv4 } = require('uuid');

exports.parse = function (actions) {
    if (actions == undefined)
        return [];

    const id = uuidv4();
    
    return Object.entries(actions)
        .map(kvp => transformToAction(id, kvp[0], kvp[1]));
}

function transformToAction(id, key, action) {
    return {
        id: `${id}-${key}`,
        name: action.name ?? key,
        items: transformToFormFields(id, action.schema, action.ui, [])
    }
}

function transformToFormFields(id, schema, ui, parents) {
    if (schema.properties) {
        return Object.entries(schema.properties)
            .filter(kvp => !containsKey(parents, kvp[0], ui?.hidden))
            .map(kvp => {
                const key = kvp[0];
                const property = kvp[1];
                const required = schema.required != undefined ? schema.required.includes(key) : false;

                return transformToFormField(id, property, ui, parents, key, required);
            });
    }

    if (schema.oneOf) {
        return schema.oneOf.map(p => transformToFormField(id, p, ui, parents, 'oneOf', false));
    }

    if (schema.items) {
        return transformToFormField(id, schema.items, ui, parents, 'array', false);
    }

    return transformToFormField(id, schema, ui, parents, 'item', false);
}


function transformToFormField(id, property, ui, parents, key, required) {
    const field = {
        id: `${id}-${key}`,
        name: key,
        label: containsKey(parents, key, ui?.use_description_as_label) ? property.description : (property.title ?? key),
        description: property.description,
        required: required,
        value: property.example
    }

    if (property.oneOf) {
        field.items = property.oneOf.map(p => transformToFormField(id, p, ui, parents, p.title ?? "oneOf", false));
        field.editor = {
            type: 'one-of'
        };
    }
    else if (property.properties)
        field.items = transformToFormFields(id, property, ui, [...parents, key]);
    else if (property.items) {
        field.value = transformToFormField(id, property.items, ui, [...parents, key], required);
        field.editor = {
            type: 'collection'
        };
    }
    else
        field.editor = transformToEditor(id, property, getEditor(parents, key, ui?.editors));

    return field;
}

function transformToEditor(id, property, editor) {
    switch (editor) {
        case "EnumCheckbox":
            return {
                type: "checkbox-group",
                options: property.enum.map(o => ({
                    id: `${id}-${o}`,
                    name: o,
                    value: o
                }))
            }         
    }
    
    if (property.type === "boolean") {
        if(property.nullable) {
            return {
                type: "radio-group",
                options: [ "true", "false" ].map(o => ({
                    id: `${id}-${o}`,
                    name: o,
                    value: o
                }))
            }
        }
        else {
            return {
                type: "input",
                inputType: 'checkbox'
            };
        }
    }

    if (property.type === "number" || property.type === "integer") {
        return {
            type: "input",
            inputType: "number",
            format: property.format ?? false,
            minimum: property.format ?? false,
            maximum: property.format ?? false,
            multipleOf: property.format ?? false,
            exclusiveMinimum: property.format ?? false,
            exclusiveMaximum: property.format ?? false,
        };
    }

    if (property.type === "string") {
        if (property.enum) {
            return {
                type: "select",
                options: property.enum.map(o => ({
                    name: o,
                    value: o
                }))
            }
        }
        else {
            var type = mapHtml5InpputType(property);
            if (type != undefined) {
                return {
                    type: "input",
                    inputType: type,
                    pattern: property.pattern ?? false
                }
            }

            switch (property.format) {
                case "byte":
                    return {
                        type: "input",
                        inputType: "file"
                    }
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
}

function containsKey(parents, key, collection) {
    if (collection == undefined)
        return false;

    const id = `${[...parents, key].join(".")}`;
    return collection.includes(id);
}

function getEditor(parents, key, editors) {
    if(editors == undefined)
        return false;

    const id = `${[...parents, key].join(".")}`;

    return editors[id];
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

