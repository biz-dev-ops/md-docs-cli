const fs = require('fs').promises;
const { env } = require('process');;
const mergeAllOf = require("json-schema-merge-allof");
const refParser = require("@apidevtools/json-schema-ref-parser");

exports.parse = async function (file) {
    const json = mergeAllOfInSchema(await refParser.dereference(file));

    if (env.NODE_ENV === 'development')
        await fs.writeFile(`${file}.json`, JSON.stringify(json));
    
    return json;
}

mergeAllOfInSchema = (object) => {
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