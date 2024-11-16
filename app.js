const express = require('express');
const amqp = require('amqplib');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 5000;
const fs = require('fs');
const archiver = require('archiver');
const chokidar = require('chokidar')
const unzipper = require('unzipper');

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

function countPDFFiles() {
    return fs.readdirSync(OUTPUT_PATH).filter(file => path.extname(file) === '.pdf').length;
}

const upload = multer({storage: storage});
const watcher = chokidar.watch(OUTPUT_PATH);

async function extractZip(zipFilePath, outputFolder) {
    return fs.createReadStream(zipFilePath)
        .pipe(unzipper.Extract({path: outputFolder}))
        .promise();
}
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
app.post('/upload', upload.single('file'), async (req, res) => {

    const zipFilePath = req.file.path;
    console.log(zipFilePath);
    await extractZip(zipFilePath, 'uploads/');
    const imageFiles = getAllFiles('uploads/').filter(file => /\.(jpg|jpeg|png)$/i.test(file));
    console.log(imageFiles);
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    channel.assertQueue('ocr', {durable: true});
    try {
        for (const imageFile of imageFiles) {
            const filePath = path.join(imageFile);
            const output = {fileName: imageFile, absolutePath: path.resolve(filePath)};
            channel.sendToQueue('ocr', Buffer.from(JSON.stringify(output)));
            console.log(`Sent to queue: ${filePath}`);
        }
    } catch (error) {
        res.status(500).json({message: 'Có lỗi xảy ra khi upload ảnh', error});
        console.error("Error 500: ", error);
    }

    const zipPath = path.join(__dirname, "server", 'output', 'images.zip');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip');

    archive.on('error', (err) => {
        console.error(err);
        res.status(500).send('Error creating zip file');
    });

    archive.pipe(output);


    watcher.on('add', filePath => {
        const fileName = path.basename(filePath);
        if (path.extname(filePath) === '.pdf') {
            console.log(`File PDF mới được thêm: ${filePath}`);
            archive.file(filePath, {name: fileName});

            const pdfCount = countPDFFiles();
            console.log(`Số lượng file PDF hiện tại: ${pdfCount}`);

            if (pdfCount >= imageFiles.length) {
                console.log('Đủ số lượng file PDF cần thiết!');
                archive.finalize();

                output.on('close', () => {
                    res.status(200).json({message: 'ZIP file created', fileName: 'images.zip'});
                    // files.forEach((file) => fs.unlinkSync(file.path));
                    // files.forEach((file) => {
                    //     const pdfName = path.parse(file.originalname).name + '.pdf';
                    //     const filePath = path.join(OUTPUT_PATH, pdfName);
                    //     fs.unlinkSync(filePath);
                    // });
                    watcher.close();
                });
            }
        }
    });
});


app.get('/download', (req, res) => {
    const zipPath = path.join(__dirname, 'server', 'output', 'images.zip');
    if (fs.existsSync(zipPath)) {
        res.download(zipPath, 'images.zip', (err) => {
            if (err) {
                console.error(err);
            }
            fs.unlinkSync(zipPath);
        });
    } else {
        res.status(404).send('Zip file not found');
    }
});

app.listen(port, () => {
    console.log(`ITTP app listening on port ${port}`);
});