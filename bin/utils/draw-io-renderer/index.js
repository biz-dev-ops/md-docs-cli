const fs = require('fs').promises;
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
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const json = encodeURIComponent(JSON.stringify(data));

        await page.goto(`${url}?data=${json}`, {
            timeout: 5000,
            waitUntil: 'domcontentloaded'
        });
        
        const svg = await page.evaluate(() => {
            return document.getElementById('result').innerText;
        });
        
        await page.close();
        await browser.close();

        return svg;
    }

    async dispose() {
        //await browser.close();
        console.log(`disposing......`);
    }
}
