const translate = require('@iamtraction/google-translate');
const amqp = require('amqplib');

async function engToViet() {
    try {
        console.log('Đang kết nối tới RabbitMQ Server');
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        console.log('Đã kết nối tới RabbitMQ Server');

        const queueTranslate = 'Translate';
        const queuePDF = 'PDF';

        await channel.assertQueue(queueTranslate, {durable: true});
        await channel.assertQueue(queuePDF, {durable: true});

        console.log('Đang chờ tin nhắn trong hàng đợi', queueTranslate);

        channel.consume(queueTranslate, async (msg) => {
            console.log('Nhận tin nhắn với nội dung text:', msg.content.toString());
            const translatedText = await translate(JSON.parse(msg.content.toString()), {to: 'vi'});
            console.log('Nội dung text được dịch:', translatedText);

            channel.sendToQueue(queuePDF, Buffer.from(JSON.stringify(translatedText)), {persistent: true});
            console.log('Text đã gửi tới hàng đợi PDF');
            channel.ack(msg);
        }, {noAck: false});
    } catch (error) {
        console.error(error);
    }
}
engToViet()
