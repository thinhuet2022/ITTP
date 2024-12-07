const { Worker } = require('worker_threads');
const path = require('path');

// Hàm tạo worker mới và xử lý ảnh
function runOCRWorker(filePath, fileName) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./server/worker/OcrWorker.js', {
            workerData: { filePath, fileName }
        });

        worker.on('message', (message) => {
            if (message.error) {
                reject(new Error(message.error));
            } else {
                console.log(`OCR result for ${message.fileName}: ${message.result}`);
                resolve(message.result);
            }
        });

        worker.on('error', (error) => {
            reject(error);
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}

// Hàm xử lý nhiều ảnh song song
async function processMultipleImages(imagePaths) {
    const promises = imagePaths.map((image) => runOCRWorker(image.filePath, image.fileName));
    const results = await Promise.all(promises);
    console.log('All images processed:', results);
}

module.exports = { runOCRWorker, processMultipleImages };