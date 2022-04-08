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

        await page.goto(`${url}?data=${encodeURIComponent(JSON.stringify(data))}`, {
            timeout: 5000,
            waitUntil: 'domcontentloaded'
        });
        
        const svg = await page.evaluate(() => {
            const svg = document.body.querySelector('svg');
            return svg.outerHTML;
        });
        
        await page.close();
        await browser.close();

        return svg;
    }
}
