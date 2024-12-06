const express = require('express');
const amqp = require('amqplib');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const archiver = require('archiver');
const chokidar = require('chokidar');

const app = express();
const port = 5000;
app.use(cors());
const BATCH_SIZE = 1;

const OUTPUT_PATH = path.resolve("server/output");
const UPLOAD_PATH = path.resolve("uploads");

// Cấu hình multer để lưu file vào RAM (memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Hàm đọc tất cả file trong thư mục (đệ quy, bất đồng bộ)
const getAllFiles = async (dirPath) => {
    let arrayOfFiles = [];
    const files = await fs.readdir(dirPath);

    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = await fs.stat(fullPath);
        if (stat.isDirectory()) {
            const nestedFiles = await getAllFiles(fullPath);
            arrayOfFiles = arrayOfFiles.concat(nestedFiles);
        } else {
            arrayOfFiles.push(fullPath);
        }
    }
    return arrayOfFiles;
};

// POST /upload: Xử lý upload và gửi ảnh đến hàng đợi RabbitMQ
app.post('/upload', upload.array('file'), async (req, res) => {
    const startTime = process.hrtime();
    const imageFiles = req.files;

    if (!imageFiles || imageFiles.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }

    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue('ocr', { durable: true });

    try {
        // Gom nhóm ảnh thành các batch
        const batches = [];
        for (let i = 0; i < imageFiles.length; i += BATCH_SIZE) {
            const batch = imageFiles.slice(i, i + BATCH_SIZE).map((imageFile) => {
                if (!imageFile.buffer || imageFile.buffer.length === 0) {
                    throw new Error(`Invalid image buffer for file: ${imageFile.originalname}`);
                }
                console.log(`Preparing file: ${imageFile.originalname}`);
                return {
                    fileName: imageFile.originalname,
                    buffer: imageFile.buffer, // Dữ liệu ảnh được lưu trong RAM (buffer)
                };
            });
            batches.push(batch);
        }
        // Gửi từng batch vào queue
        await Promise.all(
            batches.map((batch, index) => {
                console.log(`Sending batch ${index + 1} to queue...`);
                const batchPayload = { batchIndex: index + 1, images: batch }; // Đính kèm thông tin lô
                channel.sendToQueue('ocr', Buffer.from(JSON.stringify(batchPayload)));
            })
        );
        // await Promise.all(
        //     imageFiles.map((imageFile) => {
        //         console.log(`Received file: ${imageFile.originalname}`);
        //         console.log(`Buffer length: ${imageFile.buffer.length}`);
        //         const output = {
        //             fileName: imageFile.originalname,
        //             buffer: imageFile.buffer,  // Dữ liệu ảnh được lưu trong RAM (buffer)
        //         };
        //         if (!imageFile.buffer || imageFile.buffer.length === 0) {
        //             throw new Error('Invalid image buffer');
        //         }
        //         channel.sendToQueue('ocr', Buffer.from(JSON.stringify(output)));
        //         console.log(`Sent to queue: ${imageFile.originalname}`);
        //     })
        // );

        const watcher = chokidar.watch(OUTPUT_PATH, { ignoreInitial: true });
        let pdfCount = 0;

        watcher.on('add', async (filePath) => {
            if (path.extname(filePath) === '.pdf') {
                pdfCount++;
                console.log(`New PDF detected: ${filePath} (${pdfCount}/${imageFiles.length})`);

                if (pdfCount === imageFiles.length) {
                    console.log('All PDFs processed!');
                    const endTime = process.hrtime(startTime);
                    console.log(`Thời gian cần để chạy 1 job là: ${endTime[0]}s ${endTime[1] / 1e6}ms `);
                    res.status(200).json({ message: 'Processing completed. Ready to download.' });
                    watcher.close();
                }
            }
        });

        watcher.on('error', (error) => {
            console.error('Watcher error:', error);
            res.status(500).json({ message: 'Error during file processing', error });
            watcher.close();
        });
    } catch (error) {
        console.error('Error during upload process:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// GET /download: Tạo và tải file ZIP
app.get('/download', async (req, res) => {
    const zipPath = path.join(OUTPUT_PATH, 'images.zip');

    try {
        const output = await fs.open(zipPath, 'w');
        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.pipe(output.createWriteStream());

        const pdfFiles = await fs.readdir(OUTPUT_PATH);
        pdfFiles
            .filter((file) => path.extname(file) === '.pdf')
            .forEach((file) => {
                const filePath = path.join(OUTPUT_PATH, file);
                archive.file(filePath, { name: path.basename(file) });
            });

        archive.finalize();

        output.on('close', async () => {
            console.log(`${archive.pointer()} total bytes written`);
            res.download(zipPath, 'images.zip', async (err) => {
                if (err) {
                    console.error('Error during file download:', err);
                }
                // Dọn dẹp thư mục
                await fs.rm(OUTPUT_PATH, { recursive: true, force: true });
                await fs.mkdir(OUTPUT_PATH);
            });
        });
    } catch (error) {
        console.error('Error during file zipping:', error);
        res.status(500).json({ message: 'Error during download process', error });
    }
});

// Khởi động server
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
