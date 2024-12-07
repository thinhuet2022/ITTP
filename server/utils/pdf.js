const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const FONT_PATH = "./server/font/Roboto-Regular.ttf";
async function processPdf(message) {
    try {
        const data = JSON.parse(message.value);
        const { fileName, text } = data;
        const fileNameWithoutExtension = path.parse(fileName).name;
        const outFile = `./server/output/${fileNameWithoutExtension}.pdf`;
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(outFile));
        doc.fontSize(10)
            .font(FONT_PATH)
            .text(text, 50, 50);
        doc.end();
        console.log(`PDF created for file: ${fileName}`);
    } catch (error) {
        console.error('Error creating PDF:', error);
    }
}
module.exports = { processPdf };