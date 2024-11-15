const { connected } = require('process');
const Source = require('../Abstract/Source');
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
        const output = {    fileName: data.originalname,
                            absolutePath: path.resolve(data.path)};
        return Buffer.from(JSON.stringify(output));
    }
}

module.exports = SourceFilter;