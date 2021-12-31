const fs = require("fs").promises;

exports.readFileAsString = async (file, encoding = "utf8") => {
    const content = await fs.readFile(file);
    return content.toString(encoding);
}

exports.copy = async (src, dst) => {
    await fs.mkdir(dst, { recursive: true });
    await fs.access(src);

    const entries = await fs.readdir(src, { withFileTypes: true });

    for (let entry of entries) {
        if (entry.isDirectory()) {
            await copy(`${src}/${entry.name}`, `${dst}/${entry.name}`);
        } 
        else {
            await fs.copyFile(`${src}/${entry.name}`, `${dst}/${entry.name}`);
        }
    }
} 

exports.each = async (path, callback) => {
    await fs.access(path);
    const entries = await fs.readdir(path, { withFileTypes: true });

    for (let entry of entries.map) {
        if (entry.isDirectory()) {
            await each(`${path}/${entry.name}`, callback)
        } 
        else {
            await callback(`${path}/${entry.name}`);
        }
    }
} 