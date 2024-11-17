const IntermediateFilter = require('../Abstract/IntermediateFilter');
const ocr = require('tesseract.js');

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
} 

class OcrFilter extends IntermediateFilter {
    constructor() {
        super("ocr", "translate",3);
    }
    /**
     * 
     * @param {object} data - {fileName, absolutePath}
     */
    async process(data) {
        const {data: {text}} = await ocr.recognize(data.absolutePath, 'eng');
        const output = {    fileName: data.fileName,
                            englishText: text}
        // console.log('Number of recognized text',numberOfRecognizedText);
        return Buffer.from(JSON.stringify(output));
    }
}
async function run() {
    const ocrFilter = new OcrFilter();
    await ocrFilter.connectPipes()
    await ocrFilter.run();
}
run().then(r => console.log('OcrFilter is running'));
