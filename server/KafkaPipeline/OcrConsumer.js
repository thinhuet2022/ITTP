const kafka = require('kafka-node');
const tesseract = require('tesseract.js');
const path = require("node:path");
const fs = require("node:fs");
const crypto = require('crypto');


// Tạo Consumer Group ID duy nhất
const consumerGroupId = process.env.CONSUMER_GROUP_ID || `ocr-consumer-${crypto.randomUUID()}`;
const kafkaClient = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });
const consumerOptions = {
    kafkaHost: 'localhost:9092',
    groupId: consumerGroupId,
    sessionTimeout: 30000,
    protocol: ['roundrobin'], // Phân phối message theo vòng tròn (nếu cần)
    autoCommit: true,
    fromOffset: 'latest',
};

const consumer = new kafka.ConsumerGroup(consumerOptions, 'ocr');
const producer = new kafka.Producer(kafkaClient);

producer.on('ready', () => console.log('Kafka Producer for OCR is ready.'));
producer.on('error', (err) => console.error('Kafka Producer error:', err));

consumer.on('message', async (message) => {
  //  console.log('OCR Consumer received message:', message);

    try {
        const data = JSON.parse(message.value);
        // Xử lý OCR bằng Tesseract
        tesseract.recognize(data.filePath, 'eng')
            .then(({ data: { text } }) => {
                console.log(`OCR result: ${text}`);

                const ocrMessage = {
                    fileName: data.fileName,
                    text: text,
                };

                // Gửi kết quả OCR đến Kafka topic 'translate'
                producer.send(
                    [{ topic: 'translate', messages: JSON.stringify(ocrMessage) }],
                    (err, data) => {
                        if (err) console.error('Error sending OCR result:', err);
                        else console.log(`Sent OCR result for ${ocrMessage.fileName} to topic translate.`);
                    }
                );
            })
            .catch((error) => {
                console.error('Error during OCR process:', error);
            });
            // .finally(() => {
            //     // Xóa file tạm sau khi xử lý xong
            //     // fs.promises.unlink(tempFilePath).catch((err) => console.error('Error deleting temp file:', err));
            // });

    } catch (error) {
        console.error('Error processing message from Kafka:', error);
    }
});

consumer.on('error', (err) => console.error('OCR Consumer error:', err));
