const Sink = require('../Abstract/Sink');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const FONT_PATH = './server/font/Roboto-Bold.ttf';

class PdfFilter extends Sink {
    constructor() {
        super("pdf",3);
    }
    /**
     *
     * @param {object} data - {fileName, translatedText}
     */
    async process(data) {
        const generatedPDFText = data.translatedText;
        // console.log('Generated PDF text:', generatedPDFText);
        const fileNameWithoutExtension = path.parse(data.fileName).name;
        const outFile = './server/output/' + fileNameWithoutExtension + '.pdf';
        try {
            const doc = new PDFDocument();
            doc.pipe(fs.createWriteStream(outFile));
            doc.fontSize(10)
                .font(FONT_PATH)
                .text(generatedPDFText, 50, 50);
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
