const yaml = require('js-yaml');
const path = require('path');
const files = require('../../files');

const parseFile = async function (file) {
    let obj = await readFile(file);
    if(Array.isArray(obj))
        return await parseFileReferences(file, obj);

    return await parseFileReference(file, obj);
}

const parseFileReferences = async (src, refs) =>
    (
        await Promise.all(refs.map(async ref => parseFileReference(src, ref)))
    ).flat();

async function parseFileReference(src, obj) {
    if (typeof obj == 'string') {
        const file = path.resolve(path.dirname(src), obj);
        
        if (path.extname(file) === '.feature')
            return [file];
        else if (file.endsWith('features.yml'))
            return await parseFile(file);

        throw new Error(`Unsupported file type: ${file}`);
    }

    if(obj.features) {
        if(obj.name)
            return [{
                name: obj.name,
                files: await parseFileReferences(src, obj.features)
            }]

        return await parseFileReferences(src, obj.features);
    }   

    throw new Error(`Unsupported obj: ${obj}`);
}

async function readFile(file) {
    const content = await files.readFileAsString(file);
    const json = yaml.load(content);
    return json;
}

exports.parse = async (file) => await parseFile(file);