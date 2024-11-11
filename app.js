const express = require('express');
const amqp = require('amqplib');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const Pipeline = require('./server/utils/Pipeline.js');
const app = express();
const port = 5000;

app.use(cors());


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
const pipeLine = new Pipeline();

app.post('/upload', upload.array('images'),async (req, res) => {
    try {
        const files = req.files;
        const tasks = files.map(file => pipeLine.process(file));
        for (task of tasks) {
            await task;
        }
        res.status(200).json({ message: 'Upload thành công!', files });
    } catch (error) {
        res.status(500).json({ message: 'Có lỗi xảy ra khi upload ảnh', error });
        console.error("Error 500: ", error);
    }
    
});

app.listen(port, () => {
    console.log(`ITTP app listening on port ${port}`);
});