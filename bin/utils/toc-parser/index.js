module.exports = class TocParser {
    parse(element) {
        return Array.from(element.querySelectorAll(".header h2"))
            .map(h2 => ({
                id: h2.id,
                name: h2.childNodes[0].textContent
            }));
    }
}