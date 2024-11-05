const ocr = require('tesseract.js');
const amqp = require('amqplib');
const {unlink} = require("node:fs");

async function imageToText() {
        console.log('Đang kết nối tới RabbitMQ Server');
        const connection = await amqp.connect('amqp://127.0.0.1');
        const channel = await connection.createChannel();
        console.log('Đã kết nối tới RabbitMQ Server');

        const queueOCR = 'imageToText';
        const queueTranslate = 'Translate';

        await channel.assertQueue(queueOCR, {durable: true});
        await channel.assertQueue(queueTranslate, {durable: true});

        console.log('Chờ tin nhắn trong hàng chờ', queueOCR);

        channel.consume(queueOCR, async (msg) => {


            const imagePath = JSON.parse(msg.content.toString());
            console.log('Đã nhận tin nhắn với đường dẫn tới hình ảnh:', imagePath);

            try {
                const {data: {text}} = await ocr.recognize(imagePath, 'eng');
                console.log('Nội dung trích xuất:', text);

                channel.sendToQueue(queueTranslate, Buffer.from(JSON.stringify(text)), {persistent: true});
                console.log('Đã gửi text tới hàng đợi Translate');

            } catch (error) {
                console.error('Lỗi khi gửi tin nhắn tới hàng đợi Translate', error);
            }
            channel.ack(msg);
            unlink(imagePath, (err) => {
                if (err) console.error('Error deleting file:', err);
                else console.log('File deleted:', imagePath);
            });
        }, {noAck: false});
}

imageToText();
