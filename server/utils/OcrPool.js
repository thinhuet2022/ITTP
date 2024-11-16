const {Worker} = require('worker_threads');
const path = require('path');
const Filter = require("./Abstract/Filter");
const IntermediateFilter = require("./Abstract/IntermediateFilter");

class OcrPool extends IntermediateFilter{
    constructor(numberOfInstances) {
        super('ocr','translate');
        this.numberOfInstances = numberOfInstances;
    }
    async run() {
        // Tạo các worker cho OcrFilter
        for (let i = 0; i < this.numberOfInstances; i++) {
            workers.push(createOcrWorker());
        }
    }
}

workers = [];

function createOcrWorker() {
    const worker = new Worker(path.join(__dirname, 'OcrWorker.js'));

    // worker.on('message', (message) => {
    //     if (message.success) {
    //         console.log(`Processed result for ${message.data}:`, message.result);
    //         // Tại đây, bạn có thể gửi kết quả vào hàng đợi tiếp theo hoặc xử lý thêm nếu cần.
    //     } else {
    //         console.error(`Error processing ${message.data}:`, message.error);
    //     }
    // });
    worker.on('error', (error) => {
        console.error('Worker error:', error);
    });
    worker.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Worker stopped with exit code ${code}`);
            // Khởi động lại worker nếu cần thiết
            createOcrWorker();
        }
    });
    return worker;
}


module.exports = OcrPool;
