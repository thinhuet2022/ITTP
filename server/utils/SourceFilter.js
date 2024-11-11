const Source = require('./Abstract/Source');
const path = require('path');

class SourceFilter extends Source {
    constructor() {
        super("ocr");
    }
    /**
     * 
     * @param {file} data - file path that need transform to string its absolute path
     * @returns 
     */
    async process(data) {
        return Buffer.from(JSON.stringify(path.resolve(data.path)));
    }
}

module.exports = SourceFilter;