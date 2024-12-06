const Sink = require('../Abstract/Sink');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const FONT_PATH = './server/font/Roboto-Bold.ttf';

class PdfFilter extends Sink {
    constructor() {
        super("pdf", 3); // Tên queue là "pdf", prefetch là 3
    }

    /**
     *
     * @param {object} data - { batchIndex, translatedResults: [{fileName, translatedText}] }
     */
    async process(data) {
        const batchIndex = data.batchIndex;
        const results = data.translatedResults;

        try {
            console.log(`Processing batch ${batchIndex} with ${results.length} items.`);

            // Xử lý từng kết quả trong batch
            for (const item of results) {
                const { fileName, translatedText } = item;

                // Lấy tên file không chứa phần mở rộng
                const fileNameWithoutExtension = path.parse(fileName).name;
                const outFile = `./server/output/${fileNameWithoutExtension}.pdf`;

                // Tạo file PDF
                const doc = new PDFDocument();
                doc.pipe(fs.createWriteStream(outFile));
                doc.fontSize(10)
                    .font(FONT_PATH)
                    .text(translatedText, 50, 50);
                doc.end();

                console.log(`PDF created for file: ${fileName}`);
            }

            console.log(`Batch ${batchIndex} processed successfully.`);
        } catch (error) {
            console.error(`Error processing batch ${batchIndex}:`, error);
            throw error;
        }
    }
}

// Chạy Pdf Filter
async function run() {
    const pdfFilter = new PdfFilter();
    await pdfFilter.connectPipes(); // Kết nối với queue
    await pdfFilter.run(); // Bắt đầu xử lý
}
run().then(() => console.log('PdfFilter is running.'));
