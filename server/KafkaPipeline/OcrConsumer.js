const KafkaManager = require("./KafkaManagement");
const {PARTITION_1, CONSUMER_OPTIONS, PARTITION_2, OCR_TOPIC, TRANSLATE_TOPIC} = require("../constant/constant");
const processOcr = require("../utils/ocr");

const kafkaInstance = new KafkaManager({kafkaHost: 'localhost:9092'});

kafkaInstance.startProducer('Translate');

kafkaInstance.addConsumer('ocr_topic', 'ocr-consumer-group', CONSUMER_OPTIONS);

const consumer = kafkaInstance.consumers.pop();

let consumerCount = 0;
let count = 0;
consumer.on('message', async (message) => {
    console.log(`Processing OCR task ${++consumerCount}`);
    const startTime = process.hrtime();
    try {
        const OcrMessage = await processOcr(message);
        kafkaInstance.sendMessage('translate', OcrMessage, PARTITION_1);
    }
    catch (error) {
        console.error('Error processing OCR:', error);
    }
    finally {
        const endTime = process.hrtime(startTime);
        count++;
        console.log(`OCR time for task ${count} is: ${endTime[0]}s ${(endTime[1] / 1e6).toFixed(1)}ms`);
    }

});

consumer.on('error', (err) => console.error('OCR Consumer error:', err));