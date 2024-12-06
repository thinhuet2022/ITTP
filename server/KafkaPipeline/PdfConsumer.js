const kafka = require('kafka-node');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const path = require('path');
const FONT_PATH = './server/font/Roboto-Regular.ttf';

const OUTPUT_PATH = path.resolve('output');

// Kafka Consumer setup
const kafkaClient = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });
const consumer = new kafka.Consumer(kafkaClient, [{ topic: 'pdf', partition: 0 }], { autoCommit: true });

consumer.on('message', async (message) => {
   // console.log('PDF Consumer received message:', message);

    try {
        const data = JSON.parse(message.value);
        const { fileName, text } = data;

        // Lấy tên file không chứa phần mở rộng
        const fileNameWithoutExtension = path.parse(fileName).name;
        const outFile = `./server/output/${fileNameWithoutExtension}.pdf`;

        // Tạo file PDF
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(outFile));
        doc.fontSize(10)
            .font(FONT_PATH)
            .text(text, 50, 50);
        doc.end();

        console.log(`PDF created for file: ${fileName}`);
    } catch (error) {
        console.error('Error creating PDF:', error);
    }
});

consumer.on('error', (err) => console.error('PDF Consumer error:', err));
