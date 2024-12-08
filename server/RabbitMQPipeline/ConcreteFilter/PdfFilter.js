const Sink = require('../Abstract/Sink');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const FONT_PATH = './server/font/Roboto-Regular.ttf';

class PdfFilter extends Sink {
    constructor() {
        super("pdf");
    }

    async process(data) {
        const startTime = process.hrtime();
        const generatedPDFText = data.translatedText;
        const fileNameWithoutExtension = path.parse(data.fileName).name;
        const outFile = './server/output/' + fileNameWithoutExtension + '.pdf';
        try {
            const doc = new PDFDocument();
            doc.pipe(fs.createWriteStream(outFile));
            doc.fontSize(10)
                .font(FONT_PATH)
                .text(generatedPDFText, 50, 50);
            doc.end();
            const elapsedTime = process.hrtime(startTime);
            console.log(`PdfFilter: Processed ${data.fileName} in ${elapsedTime[0]}s ${(elapsedTime[1] / 1e6).toFixed(0)}ms`);
        } catch (error) {
            console.error('Error during PDF creation:', error);
            throw error;
        }
    }
}

async function run() {
    const pdfFilter = new PdfFilter();
    await pdfFilter.connectPipes();
    await pdfFilter.run();
}
run().then(() => console.log('PdfFilter is running.'));
