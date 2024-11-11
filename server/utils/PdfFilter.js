const Sink = require('./Abstract/Sink');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const OUT_FILE = './server/output/output' + Date.now() +'.pdf';
const FONT_PATH = './server/font/Roboto-Bold.ttf';

class PdfFilter extends Sink {
    constructor() {
        super("pdf");
    }
    /**
     * 
     * @param {string} data - Vietnamese text 
     */
    async process(data) {
        const generatedPDFText = data.text;
        try {
            const doc = new PDFDocument();
            doc.pipe(fs.createWriteStream(OUT_FILE));
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

module.exports = PdfFilter;