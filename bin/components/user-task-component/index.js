const fs = require('fs');
const path = require('path');
const pug = require('pug');
const files = require('../../utils/files');

module.exports = class UserTaskComponent {
    constructor(template) {
        createEditorTemplate();
        
        const pugFile = path.resolve(__dirname, `template.pug`);

        this.renderFn = pug.compile(template ?? files.readFileAsStringSync(pugFile), { filename: pugFile });
    }

    render(data) {
        return this.renderFn(data);
    }
}

function createEditorTemplate() {
    const entries = fs.readdirSync(path.resolve(__dirname, `editors`), { withFileTypes: true });
    const lines = [];

    for (let entry of entries) {
        if (entry.isDirectory())
            continue;

        lines.push(`if(item.editor.type === '${entry.name.slice(0, -4)}')`)
        lines.push(`\tinclude ../editors/${entry.name}`);
    }

    const generated = path.resolve(__dirname, `.generated`);
    
    if (!fs.existsSync(generated))
        fs.mkdirSync(generated);

    fs.writeFileSync(path.resolve(generated, `editor.pug`), lines.join('\n'), 'utf8');
}