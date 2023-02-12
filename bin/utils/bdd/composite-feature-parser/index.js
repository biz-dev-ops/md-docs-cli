const yaml = require('js-yaml');
const path = require('path');
const files = require('../../files');

parseConfigFile = async function(configFile) {
    let config = await readConfig(configFile);
    
    if (Array.isArray(config))
        config = {
            features: config
        };
    
    const files = [];

    for (const ref of config.features) {
        files.push(...await parseFeatureReference(path.resolve(path.dirname(configFile), ref)));
    }
    
    return files;
}

readConfig = async function(file) {
    const content = await files.readFileAsString(file);
    const json = yaml.load(content);
    return json;
}

parseFeatureReference = async function (file) {
    if (path.extname(file) === '.feature')
        return [ file ];
    
    if (file.endsWith('features.yml')) {
        const container = path.basename(path.dirname(file));
        return [{
            name: container,
            files: await parseConfigFile(file)
        }];
    }

    throw new Error(`Unsupported file type: ${file}`);        
}

exports.parse = async (configFile) => { return await parseConfigFile(configFile); };