const IntermediateFilter = require('../Abstract/IntermediateFilter');
const ocr = require('tesseract.js');

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
} 

class OcrFilter extends IntermediateFilter {
    constructor() {
        super("ocr", "translate");
    }
    /**
     * 
     * @param {object} data - {fileName, absolutePath}
     */
    async process(data) {
        const {data: {text}} = await ocr.recognize(data.absolutePath, 'eng');
        const output = {    fileName: data.fileName,
                            englishText: text}
        return Buffer.from(JSON.stringify(output));
    }
}

module.exports = OcrFilter;