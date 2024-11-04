const express = require('express');
const amqp = require('amqplib');

const app = express();
const port = 3000;

app.get('/', async (req, res) => {
    const connection = await amqp.connect('amqp://127.0.0.1');
    const channel = await connection.createChannel();

    console.log('Đã kết nối tới RabbitMQ Server');

    const queueOCR = 'imageToText';
    await channel.assertQueue(queueOCR, {durable: true});
    try {
        console.log('Đang gửi tin nhắn tới hàng đợi OCR');
        channel.sendToQueue(queueOCR, Buffer.from(JSON.stringify('./server/data/sample.jpg')));
        res.send('Đã gửi tin nhắn tới hàng đợi OCR');
    } catch (error) {
        console.log('Lỗi khi gửi tin nhắn tới hàng đợi OCR:', error);
    }
});

app.listen(port, () => {
    console.log(`ITTP app listening on port ${port}`);
});