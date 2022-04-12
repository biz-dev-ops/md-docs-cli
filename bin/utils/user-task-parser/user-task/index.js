exports.parse = function (data) {
    if (data == undefined)
        return null;

    return {
        name: data.name,
        items: transformToFields(data.schema, data.ui, [])
    };
}

function transformToFields(schema, ui, parents) {
    const fields = [];

    if (schema.properties) {
        for (const key in schema.properties) {
            if (hide(parents, key, ui?.hidden)) {
                continue;
            }

            fields.push(transformToField(schema.properties[key], ui, parents, key))
        }
    }
    else if (schema.oneOf) {
        for (const child of schema.oneOf) {
            fields.push(transformToField(child, ui, parents, "oneOf"));
        }
    }
    
    return fields;
}

function transformToField(property, ui, parents, key) {
    const field = {
        id: key,
        name: key,
        label: property.title ?? key,
        description: property.description
    }

    if (property.type === 'object' || property.properties)
        field.items = transformToFields(property, ui, [...parents, key]);
    else if (property.type === 'array')
        field.items = transformToFields(property.items, ui, [...parents, key]);
    else
        field.value = transformToFieldValue(property);
    
    
    return field;
}

function transformToFieldValue(property) {
    if (property.enum)
        return property.enum.join(', ');
    else
        return property.example;
}

function hide(parents, key, hidden) {
    if (hidden == undefined)
        return false;

    const id = `${[...parents, key].join(".")}`;
    return hidden.includes(id);
}