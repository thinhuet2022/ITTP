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
            // Kiểm tra dữ liệu buffer trước khi xử lý
            // if (!data.buffer || data.buffer.length === 0) {
            //     throw new Error('Invalid image buffer received');
            // }
            //
            // console.log('Processing image:', data.fileName);
            // console.log('Buffer length:', data.buffer.length);
            //
            // // Nhận diện văn bản từ ảnh
            // const { data: { text } } = await ocr.recognize(data.buffer.data, 'eng');
            //
            // const output = {
            //     fileName: data.fileName,
            //     englishText: text
            // };
            const output = {
                batchIndex:  data.batchIndex,
                results,
            }
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
