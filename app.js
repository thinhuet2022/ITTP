const express = require('express');
const multer = require('multer');
const kafka = require('kafka-node');
const cors = require('cors');
const path = require('path');
const archiver = require('archiver');
const chokidar = require('chokidar');
 const fs = require('fs/promises');
const {OCR_TOPIC, NUMBER_OF_OCR_CONSUMER} = require("./server/constant/constant");


const app = express();
const port = process.env.PORT || 5000;
app.use(express.static(path.join(__dirname, 'out')));


const OUTPUT_PATH = path.resolve("server/output");
// Kafka Producer setup
const kafkaClient = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });
const producer = new kafka.Producer(kafkaClient);

producer.on('ready', () => console.log('Kafka Producer is ready.'));
producer.on('error', (err) => console.error('Kafka Producer error:', err));

// Multer setup for disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Tạo tên file duy nhất
    }
});
const upload = multer({ storage });

app.use(cors());

// Endpoint nhận ảnh và gửi vào topic `ocr`
app.post('/upload', upload.array('file'), async (req, res) => {
    const imageFiles = req.files;

    if (!imageFiles || imageFiles.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }
    const startTime = process.hrtime();
    try {
        let partitionCounter = 0;

        // Gửi từng file ảnh vào Kafka topic `ocr`
        imageFiles.forEach((file) => {
            const filePath = path.join(__dirname, 'uploads', file.filename);

            console.log(`File ${file.originalname} saved at ${filePath}`);

            // Gửi file vào Kafka topic `ocr`
            const message = {
                key: file.originalname,
                fileName: file.originalname,
                filePath: filePath,
            };

            partitionCounter = partitionCounter % NUMBER_OF_OCR_CONSUMER;
            producer.send(
                [{ topic: OCR_TOPIC, messages: JSON.stringify(message), partition: partitionCounter }],
                (err, data) => {
                    if (err) {
                        console.error(`Error sending message for ${file.originalname}:`, err);
                    } else {
                        console.log(`Sent file ${file.originalname} to topic ocr.`);
                    }
                }
            );
            partitionCounter++;
        });
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
                    await fs.rm('uploads/', {recursive: true, force: true});
                    await fs.mkdir('uploads/');
                    res.status(200).json({ message: 'Processing completed. Ready to download.' });
                    await watcher.close();
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
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'out', 'index.html'));
});
// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// const express = require('express');
// const amqp = require('amqplib');
// const cors = require('cors');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs/promises');
// const archiver = require('archiver');
// const chokidar = require('chokidar');
//
// const app = express();
// const port = 5000;
// app.use(express.static(path.join(__dirname, 'out')));
// app.use(cors());
// const BATCH_SIZE = 1;
//
// const OUTPUT_PATH = path.resolve("server/output");
// const UPLOAD_PATH = path.resolve("uploads");
//
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const uploadPath = path.join(__dirname, 'uploads');
//         cb(null, uploadPath);
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.originalname); // Tạo tên file duy nhất
//     }
// });
// const upload = multer({ storage });
//
// // Hàm đọc tất cả file trong thư mục (đệ quy, bất đồng bộ)
// const getAllFiles = async (dirPath) => {
//     let arrayOfFiles = [];
//     const files = await fs.readdir(dirPath);
//
//     for (const file of files) {
//         const fullPath = path.join(dirPath, file);
//         const stat = await fs.stat(fullPath);
//         if (stat.isDirectory()) {
//             const nestedFiles = await getAllFiles(fullPath);
//             arrayOfFiles = arrayOfFiles.concat(nestedFiles);
//         } else {
//             arrayOfFiles.push(fullPath);
//         }
//     }
//     return arrayOfFiles;
// };
//
// // POST /upload: Xử lý upload và gửi ảnh đến hàng đợi RabbitMQ
// app.post('/upload', upload.array('file'), async (req, res) => {
//     const startTime = process.hrtime();
//     const imageFiles = req.files;
//
//     if (!imageFiles || imageFiles.length === 0) {
//         return res.status(400).json({ message: 'No files uploaded' });
//     }
//
//     const connection = await amqp.connect('amqp://localhost');
//     const channel = await connection.createChannel();
//     await channel.assertQueue('ocr', { durable: true });
//
//     try {
//         // Xử lý từng ảnh và gửi thẳng vào queue
//         await Promise.all(
//             imageFiles.map(async (imageFile) => {
//                 const filePath = path.join(__dirname, 'uploads', imageFile.filename);
//
//
//                 console.log(`Sending file: ${imageFile.originalname} to Ocr queue...`);
//                 const payload = {
//                     fileName: imageFile.originalname,
//                     filePath: filePath,
//                 };
//                 channel.sendToQueue('ocr', Buffer.from(JSON.stringify(payload)));
//             })
//         );
//
//         const watcher = chokidar.watch(OUTPUT_PATH, { ignoreInitial: true });
//         let pdfCount = 0;
//
//         watcher.on('add', async (filePath) => {
//             if (path.extname(filePath) === '.pdf') {
//                 pdfCount++;
//                 console.log(`New PDF detected: ${filePath} (${pdfCount}/${imageFiles.length})`);
//
//                 if (pdfCount === imageFiles.length) {
//                     console.log('All PDFs processed!');
//                     const endTime = process.hrtime(startTime);
//                     console.log(`Thời gian cần để xử lý ${imageFiles.length} ảnh là: ${endTime[0]}s ${endTime[1] / 1e6}ms `);
//                     res.status(200).json({ message: 'Processing completed. Ready to download.' });
//                     await fs.rm(UPLOAD_PATH, { recursive: true, force: true });
//                     await fs.mkdir(UPLOAD_PATH);
//                     watcher.close();
//                 }
//             }
//         });
//
//         watcher.on('error', (error) => {
//             console.error('Watcher error:', error);
//             res.status(500).json({ message: 'Error during file processing', error });
//             watcher.close();
//         });
//     } catch (error) {
//         console.error('Error during upload process:', error);
//         res.status(500).json({ message: 'Internal server error', error });
//     }
// });
//
// // GET /download: Tạo và tải file ZIP
// app.get('/download', async (req, res) => {
//     const zipPath = path.join(OUTPUT_PATH, 'images.zip');
//
//     try {
//         const output = await fs.open(zipPath, 'w');
//         const archive = archiver('zip', { zlib: { level: 9 } });
//
//         archive.pipe(output.createWriteStream());
//
//         const pdfFiles = await fs.readdir(OUTPUT_PATH);
//         pdfFiles
//             .filter((file) => path.extname(file) === '.pdf')
//             .forEach((file) => {
//                 const filePath = path.join(OUTPUT_PATH, file);
//                 archive.file(filePath, { name: path.basename(file) });
//             });
//
//         archive.finalize();
//
//         output.on('close', async () => {
//             console.log(`${archive.pointer()} total bytes written`);
//             res.download(zipPath, 'images.zip', async (err) => {
//                 if (err) {
//                     console.error('Error during file download:', err);
//                 }
//                 // Dọn dẹp thư mục
//                 await fs.rm(OUTPUT_PATH, { recursive: true, force: true });
//                 await fs.mkdir(OUTPUT_PATH);
//             });
//         });
//     } catch (error) {
//         console.error('Error during file zipping:', error);
//         res.status(500).json({ message: 'Error during download process', error });
//     }
// });
//
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'out', 'index.html'));
// });
// // Khởi động server
// app.listen(port, () => {
//     console.log(`App listening on port ${port}`);
// });
