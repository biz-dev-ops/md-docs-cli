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
    else if (schema.items) {
        fields.push(transformToField(schema, ui, parents, key))
    }
    else if (schema.oneOf) {
        let i = 1;
        for (const child of schema.oneOf) {
            fields.push(transformToField(child, ui, parents, `${parents[parents.length - 1]}-${i}`));
            i++;
        }
    }
        
    else {
        fields.push(transformToField(schema, ui, parents, 'item'))
    }
    
    return fields;
}

function transformToField(property, ui, parents, key) {
    const field = {
        name: key,
        label: property.title ?? key,
        description: property.description
    }

    if (property.properties) {
        field.type = "object";
        field.items = transformToFields(property, ui, [...parents, key]);
    }
    else if (property.items) {
        field.type = "array";
        field.items = transformToFields(property.items, ui, [...parents, key]);
    }
    else if (property.oneOf) {
        field.type = "one-of";
        field.items = transformToFields(property, ui, [...parents, key]);
    }
    else {
        field.value = transformToFieldValue(property);
    }
    
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