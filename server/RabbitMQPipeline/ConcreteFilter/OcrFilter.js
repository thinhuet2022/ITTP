const IntermediateFilter = require('../Abstract/IntermediateFilter');
const ocr = require('node-tesseract-ocr');

class OcrFilter extends IntermediateFilter {
    constructor() {
        super("ocr", "translate");
    }

    async process(data) {
        const startTime = process.hrtime();
        try {
            const result = await ocr.recognize(data.filePath, { lang: 'eng', oem: 3, psm: 6 });
            if (!result || result.trim() === '') {
                throw new Error(`OCR did not return any text for file: ${data.fileName}`);
            }
            return Buffer.from(JSON.stringify({
                fileName: data.fileName,
                englishText: result,
            }));
        } catch (error) {
            console.error('Error during OCR processing:', error);
            throw error;
        } finally {
            const elapsedTime = process.hrtime(startTime);
            console.log(`OcrFilter: Processed ${data.fileName} in ${elapsedTime[0]}s ${(elapsedTime[1] / 1e6).toFixed(0)}ms`);
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
