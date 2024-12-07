const IntermediateFilter = require('../Abstract/IntermediateFilter');
const ocr = require('tesseract.js');

class OcrFilter extends IntermediateFilter {
    constructor() {
        super("ocr", "translate", 3); // Số lượng prefetch
    }

    /**
     *
     * @param {object} data - {fileName, buffer}
     */
    async process(data) {
        try {
            const startTime = process.hrtime();
            console.log(`Processing batch number: ${data.batchIndex}`);
            const results = [];

            for ( const image of data.images) {
                const { data : {text}} = await ocr.recognize(image.buffer.data, 'eng');
                const output = {
                    fileName: image.fileName,
                    englishText: text.trim(),
                }
                results.push(output);
            }
            const output = {
                batchIndex:  data.batchIndex,
                results,
            }
            const endTime = process.hrtime(startTime);
            console.log(`Batch ${data.batchIndex} processed in ${endTime[0]}s ${endTime[1] / 1000000}ms`);
            return Buffer.from(JSON.stringify(output));
        } catch (error) {
            console.error('Error during OCR processing:', error);
            throw error;  // Đảm bảo lỗi được ném lại để quản lý tiếp
        }
    }
}

async function run() {
    const ocrFilter = new OcrFilter();
    await ocrFilter.connectPipes();
    await ocrFilter.run();
}

run().then(() => console.log('OcrFilter is running')).catch((error) => {
    console.error('OcrFilter failed to start:', error);
});
