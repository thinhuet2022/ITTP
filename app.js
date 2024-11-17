const express = require('express');
const amqp = require('amqplib');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const chokidar = require('chokidar')

const app = express();
const port = 5000;
app.use(cors());

const OUTPUT_PATH = "server/output"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});


const upload = multer({storage: storage});

// Hàm duyệt qua tất cả file trong thư mục và các thư mục con
const getAllFiles = (dirPath, arrayOfFiles = []) => {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            // Nếu là thư mục, gọi đệ quy
            getAllFiles(fullPath, arrayOfFiles);
        } else {
            // Nếu là file, thêm vào mảng
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
};
let startTime;
app.post('/upload', upload.array('file'), async (req, res) => {
    startTime = process.hrtime();
    const imageFiles = req.files;
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    channel.assertQueue('ocr', {durable: true});
    try {
        for (const imageFile of imageFiles) {
            const output = {fileName: imageFile.originalname, absolutePath: path.resolve(imageFile.path)};
            channel.sendToQueue('ocr', Buffer.from(JSON.stringify(output)));
            console.log(`Sent to queue: ${imageFile.path}`);
        }
    } catch (error) {
        res.status(500).json({message: 'Có lỗi xảy ra khi upload ảnh', error});
        console.error("Error 500: ", error);
    }

    const watcher = chokidar.watch(OUTPUT_PATH);
    let pdfCount = 0;
    watcher.on('add', filePath => {
        if (path.extname(filePath) === '.pdf') {
            pdfCount++;

            console.log(`File mới được thêm: ${filePath}`, pdfCount);

            if (pdfCount === imageFiles.length) {
                console.log('Đủ số lượng file PDF cần thiết!');
                fs.rmSync('uploads/', {recursive: true, force: true});
                fs.mkdirSync('uploads/');
                res.status(200).json({message: 'Ready to download'});
                watcher.close();
            }
        }
    });
});


app.get('/download', (req, res) => {
    const zipPath = path.join(__dirname, "server", 'output', 'images.zip');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {zlib: {level: 9}});

    output.on('close', () => {
        console.log(`${archive.pointer()} total bytes written`);

        // Gửi tệp ZIP về cho người dùng
        res.download(zipPath, 'images.zip', (err) => {
            if (err) {
                console.error('Error during file download:', err);
            }
            // Xóa tệp và tạo lại thư mục
            fs.rmSync('server/output', {recursive: true, force: true});
            fs.mkdirSync('server/output');
            const endTime = process.hrtime(startTime);
            console.log(`Execution time: ${endTime[0]}s ${endTime[1] / 1000000}ms`);
        });
    });

    archive.on('error', (err) => {
        throw err;
    });

    archive.pipe(output);
    const pdfFile = fs.readdirSync(OUTPUT_PATH).filter(file => path.extname(file) === '.pdf');
    for (const file of pdfFile) {
        const filePath = path.join(OUTPUT_PATH, file);
        archive.file(filePath, {name: path.basename(file)});
    }
    archive.finalize();
});

app.listen(port, () => {
    console.log(`ITTP app listening on port ${port}`);
});