const express = require('express');
const amqp = require('amqplib');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 5000;

app.use(cors());


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Use original file name or customize as needed
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


app.post('/upload', upload.single('image'),async (req, res) => {
    const connection = await amqp.connect('amqp://127.0.0.1');
    const channel = await connection.createChannel();

    console.log('Đã kết nối tới RabbitMQ Server');

    try {
        console.log('File uploaded:', req.file);
        res.json({ message: 'Image uploaded successfully', file: req.file });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error uploading image' });
    }

    const queueOCR = 'imageToText';
    await channel.assertQueue(queueOCR, {durable: true});
    try {
        console.log('Đang gửi tin nhắn tới hàng đợi OCR');
        channel.sendToQueue(queueOCR, Buffer.from(JSON.stringify(path.resolve(req.file.path))), {persistent: true});
    } catch (error) {
        console.log('Lỗi khi gửi tin nhắn tới hàng đợi OCR:', error);
    }
});

app.listen(port, () => {
    console.log(`ITTP app listening on port ${port}`);
});