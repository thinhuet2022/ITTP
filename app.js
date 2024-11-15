const express = require('express');
const amqp = require('amqplib');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const Pipeline = require('./server/PipesAndFilters/Pipeline.js');
const app = express();
const port = 5000;
const fs = require('fs');
const archiver = require('archiver');
const chokidar = require('chokidar')

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

const upload = multer({ storage: storage });
const pipeLine = new Pipeline();
const watcher = chokidar.watch(OUTPUT_PATH);

app.post('/upload', upload.array('images'),async (req, res) => {
    const files = req.files;
    if (!files || files.length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    try {
        const tasks = files.map(file => pipeLine.process(file));
        await Promise.all(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Có lỗi xảy ra khi upload ảnh', error });
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

            if (pdfCount >= files.length) {
                console.log('Đủ số lượng file PDF cần thiết!');
                archive.finalize();
                
                output.on('close', () => {
                    res.send(`
                        <html>
                          <body>
                            <h2>Upload Successful!</h2>
                            <a href="/download" download><button>Download Zip</button></a>
                          </body>
                        </html>
                    `);
                    files.forEach((file) => fs.unlinkSync(file.path));
                    files.forEach((file) => {
                        const pdfName = path.parse(file.originalname).name + '.pdf';
                        const filePath = path.join(OUTPUT_PATH, pdfName);
                        fs.unlinkSync(filePath);
                    });
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