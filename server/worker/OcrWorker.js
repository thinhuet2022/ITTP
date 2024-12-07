// worker.js
const { parentPort, workerData } = require('worker_threads');
const tesseract = require('node-tesseract-ocr');

const config = {
    lang: 'eng',
    oem: 3, // Default OEM (optical character recognition mode)
    psm: 6, // Page segmentation mode
};
// Hàm thực hiện OCR trên ảnh
function processImage(inputPath) {
    return tesseract.recognize(inputPath, config)
        .then((text) => {
            return text;
        })
        .catch((err) => {
            throw new Error('Error during OCR processing: ' + err.message);
        });
}

// Xử lý dữ liệu nhận từ main thread và trả kết quả
processImage(workerData.filePath)
    .then((text) => {
        parentPort.postMessage({ result: text, fileName: workerData.fileName });
    })
    .catch((err) => {
        parentPort.postMessage({ error: err.message });
    });
