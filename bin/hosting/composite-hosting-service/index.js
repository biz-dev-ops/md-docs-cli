module.exports = class CompositeHostingService {
    constructor({ hostingServices }) {
        this.hostingServices = hostingServices;
    }

    async apply() {        
        for (const hosting of this.hostingServices) {
            await hosting.apply();
        }
    }    

    rewrite(url) {
        for (const hosting of this.hostingServices) {
            if (hosting.rewrite(url))
                return true;
        }
        return false;
    } 
}