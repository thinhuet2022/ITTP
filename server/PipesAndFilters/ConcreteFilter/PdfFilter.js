const Sink = require('../Abstract/Sink');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const FONT_PATH = './server/font/Roboto-Bold.ttf';

class PdfFilter extends Sink {
    constructor() {
        super("pdf");
    }
    /**
     *
     * @param {object} data - {fileName, translatedText}
     */
    async process(data) {
        const generatedPDFText = data.translatedText;
        const fileNameWithoutExtension = path.parse(data.fileName).name;
        const outFile = './server/output/' + fileNameWithoutExtension + '.pdf';
        try {
            const doc = new PDFDocument();
            doc.pipe(fs.createWriteStream(outFile));
            doc.fontSize(16)
                .font(FONT_PATH)
                .text(generatedPDFText, 100, 100);
            doc.end();
            console.log('PDF created');
        } catch (error) {
            console.error('Lỗi khi tạo PDF', error);
        }
    }
}
async function run() {
    const pdfFilter = new PdfFilter();
    await pdfFilter.connectPipes();
    await pdfFilter.run();
}
run().then(r => console.log('PdfFilter is running'));
