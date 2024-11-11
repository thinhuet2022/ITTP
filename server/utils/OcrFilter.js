const IntermediateFilter = require('./Abstract/IntermediateFilter');
const ocr = require('tesseract.js');
const {unlink} = require("node:fs");

class OcrFilter extends IntermediateFilter {
    constructor() {
        super("ocr", "translate");
    }
    /**
     * 
     * @param {string} data - name of the image path 
     */
    async process(data) {
        const {data: {text}} = await ocr.recognize(data, 'eng');
        /*unlink(data, (err) => {
            if (err) console.error('Error deleting file:', err);
            else console.log('File deleted:', data);
        });*/
        console.log("Text regconized: ", text);
        return Buffer.from(JSON.stringify(text));
    }
}

module.exports = OcrFilter;