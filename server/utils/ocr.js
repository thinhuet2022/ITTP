const tesseract = require("node-tesseract-ocr");
const config = {
    lang: 'eng',
    oem: 3, // Default OEM (optical character recognition mode)
    psm: 6, // Page segmentation mode
};
async function processOcr(message) {
    try {
        const data = JSON.parse(message.value);
        const imagePath = data.filePath;
        const text = await tesseract.recognize(imagePath, config);
        return {
            fileName: data.fileName,
            text: text,
            key: data.fileName,
        };
    } catch (error) {
        console.error('Error during OCR process:', error);
    }
}
module.exports = processOcr;