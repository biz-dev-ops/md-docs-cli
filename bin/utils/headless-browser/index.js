const puppeteer = require('puppeteer');

module.exports = class HeadlessBrowser {

    async newPage({ url }) {
        let page;
        if(!this.browser) {
            this.browser = await puppeteer.launch({
                headless: "new",
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
        
        try {
            page = (await this.browser.newPage());
            await page.goto(url);
            return page;
        }
        catch(ex) {
            page?.close();
            page = null;
            throw ex;
        }
    }

    async dispose() {
        if (!this.browser)
            return;
        
        await this.browser.close();        
        this.browser = null;
    }
}