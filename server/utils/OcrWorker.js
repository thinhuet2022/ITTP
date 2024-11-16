// OcrWorker.js
const OcrFilter = require('./OcrFilter');
const {parentPort} = require('worker_threads');

const ocrFilter = new OcrFilter();

// Lắng nghe các tin nhắn từ luồng chính
parentPort.on('message', async (data) => {
    try {
        await ocrFilter.connectPipes();
        await ocrFilter.run();
        parentPort.postMessage({success: true, data});
    } catch (error) {
        parentPort.postMessage({success: false, error: error.message, data});
    }
});
