module.exports = class CompositeHostingService {
    constructor({ hostingServices }) {
        this.hostingServices = hostingServices;
    }

    async apply() {        
        for (const hosting of this.hostingServices) {
            await hosting.apply();
        }
    }    
}