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

const OUTPUT_PATH = path.resolve("server/output");
const UPLOAD_PATH = path.resolve("uploads");

// Cấu hình multer để lưu file
const storage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, UPLOAD_PATH),
    filename: (_, file, cb) => cb(null, file.originalname),
});
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
        await Promise.all(
            imageFiles.map((imageFile) => {
                const output = {
                    fileName: imageFile.originalname,
                    absolutePath: path.resolve(imageFile.path),
                };
                channel.sendToQueue('ocr', Buffer.from(JSON.stringify(output)));
                console.log(`Sent to queue: ${imageFile.path}`);
            })
        );

        const watcher = chokidar.watch(OUTPUT_PATH, { ignoreInitial: true });
        let pdfCount = 0;

        watcher.on('add', async (filePath) => {
            if (path.extname(filePath) === '.pdf') {
                pdfCount++;
                console.log(`New PDF detected: ${filePath} (${pdfCount}/${imageFiles.length})`);

                if (pdfCount === imageFiles.length) {
                    console.log('All PDFs processed!');
                    await fs.rm(UPLOAD_PATH, { recursive: true, force: true });
                    await fs.mkdir(UPLOAD_PATH);
                    const endTime = process.hrtime(startTime);
                    console.log(`Thời gian cần để chạy 1 job là: ${endTime[0]}s ${endTime[1]/1e6}ms `)
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
