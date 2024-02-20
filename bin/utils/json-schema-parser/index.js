const fs = require('fs').promises;
const { env } = require('process');;
const mergeAllOf = require("json-schema-merge-allof");
const refParser = require("@apidevtools/json-schema-ref-parser");
const { parse } = require('path');

exports.parse = async function (file) {
    let json = await refParser.dereference(file);

    if (env.NODE_ENV === 'development')
        await fs.writeFile(`${file}.dereferenced.json`, JSON.stringify(json));
    
    json = mergeAllOfInSchema(json);

    if (env.NODE_ENV === 'development')
        await fs.writeFile(`${file}.merged.json`, JSON.stringify(json));

    return json;
}

exports.derefence = async function (file) {
    return await parse(file);
}

exports.bundle = async function (file) {
    let json = await refParser.bundle(file);

    if (env.NODE_ENV === 'development')
        await fs.writeFile(`${file}.bundled.json`, JSON.stringify(json));

    return json;
}

mergeAllOfInSchema = (object) => {
    console.log(object);
    if(!!object["allOf"]){
        object = mergeAllOf(object, {
            resolvers: {
                defaultResolver: mergeAllOf.options.resolvers.title
            }
          });
    }
  
    for (let key in object) {
        if(typeof object[key] == "object"){
            object[key] = mergeAllOfInSchema(object[key])
        }
    }

    return object;
  }