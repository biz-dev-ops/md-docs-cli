const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

exports.readFileAsString = async (file, encoding = 'utf8') => {
    const content = await fs.readFile(file);
    return content.toString(encoding);
}

exports.readFileAsStringSync = (file, encoding = 'utf8') => {
    const content = fsSync.readFileSync(file);
    return content.toString(encoding);
}

exports.copy = async (src, dst) => {
    await fs.mkdir(dst, { recursive: true });
    await fs.access(src);

    const entries = await fs.readdir(src, { withFileTypes: true });

    for (let entry of entries) {
        if (entry.isDirectory()) {
            await copy(path.resolve(src, entry.name), path.resolve(dst, entry.name));
        } 
        else {
            await fs.copyFile(path.resolve(src, entry.name), path.resolve(dst, entry.name));
        }
    }
} 

exports.each = async (src, callback) => {
    await fs.access(src);
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (let entry of entries) {
        if (entry.isDirectory()) {
            await each(path.resolve(src, entry.name), callback)
        } 
        else {
            await callback(path.resolve(src, entry.name));
        }
    }
} 