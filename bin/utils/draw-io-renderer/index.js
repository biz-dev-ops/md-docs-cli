const puppeteer = require('puppeteer');
const files = require('../files');

module.exports = class DrawIORenderer {
    constructor({ options }) {
        this.root = options.dst;
        this.url = `file://${__dirname}/graph-viewer.html`;
        this.options = {
            highlight: "none",
            target: "self",
            lightbox: false,
            nav: true
        };
    }

    async render(file) {
        const xml = await files.readFileAsString(file);
        const data = Object.assign({ xml }, this.options);
        return await this.#renderSVG(this.url, data);
    }

    async #renderSVG(url, data) {
        if(!this.browser)
            this.browser = await puppeteer.launch({
                headless: "new",
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        
        const page = (await this.browser.newPage())
        //     .on('console', message => console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
        //     .on('pageerror', ({ message }) => console.log(message))
        //     .on('response', response => console.log(`${response.status()} ${response.url()}`))
        //     .on('requestfailed', request => console.log(`${request.failure().errorText} ${request.url()}`))
        ;
        
        const json = encodeURIComponent(JSON.stringify(data));
        
        // console.log('------------------------------------------------------------')
        // console.log(`${url}?data=${json}`)
        // console.log('------------------------------------------------------------')

        await page.goto(`${url}?data=${json}`, {
            timeout: 4000,
            waitUntil: 'domcontentloaded'
        });
        
        const svg = await page.evaluate(() => {
            return document.body.querySelector('svg').outerHTML;
        });

        console.log(svg);
        
        await page.close();
        
        return svg;
    }

    async dispose() {
        if (!this.browser)
            return;
        
        await this.browser.close();        
        this.browser = null;
    }
}
