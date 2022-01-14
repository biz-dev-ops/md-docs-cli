const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const crypto = require('crypto');

exports.readFileAsString = async (file, encoding = 'utf8') => {
    const content = await fs.readFile(file);
    return content.toString(encoding);
}

exports.readFileAsStringSync = (file, encoding = 'utf8') => {
    const content = fsSync.readFileSync(file);
    return content.toString(encoding);
}

exports.copy = async (src, dst) => {
    await fs.access(src);

    if ((await fs.stat(src)).isDirectory()) {
        await fs.mkdir(dst, { recursive: true });

        const entries = await fs.readdir(src, { withFileTypes: true });

        for (let entry of entries) {
            if (entry.isDirectory()) {
                await this.copy(path.resolve(src, entry.name), path.resolve(dst, entry.name));
            }
            else {
                await fs.copyFile(path.resolve(src, entry.name), path.resolve(dst, entry.name));
            }
        }
    }
    else {
        await fs.mkdir(path.dirname(dst), { recursive: true });
        await fs.copyFile(src, dst);
    }
}

exports.each = async (src, callback) => {
    await fs.access(src);
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (let entry of entries) {
        if (entry.isDirectory()) {
            await this.each(path.resolve(src, entry.name), callback)
        }
        else {
            await callback(path.resolve(src, entry.name));
        }
    }
}

exports.exists = async (src) => {
    try {
        await fs.access(src);
        return true;
    }
    catch {
        return false;
    }
}

exports.hash = async (file) => {
    const fileBuffer = await fs.readFile(file);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}