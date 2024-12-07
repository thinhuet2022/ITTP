const KafkaManager = require("./KafkaManagement");
const {PARTITION_1, CONSUMER_OPTIONS, PARTITION_2, TRANSLATE_TOPIC, PDF_TOPIC} = require("../constant/constant");
const {processTranslate} = require("../utils/translate");

const kafkaInstance = new KafkaManager({kafkaHost: 'localhost:9092'});

kafkaInstance.startProducer('PDF');

kafkaInstance.addConsumer('translate', 'translate-consumer-group', CONSUMER_OPTIONS);

const consumer = kafkaInstance.consumers.pop();

let count = 0;
consumer.on('message', async (message) => {
    console.log('Translate Consumer processing task');
    const startTime = process.hrtime();
    try {
        const translateMessage = await processTranslate(message);
        kafkaInstance.sendMessage('pdf', translateMessage, PARTITION_1);
    }
    catch (error) {
        console.error('Error processing translation:', error);
    }
    finally {
        const endTime = process.hrtime(startTime);
        count++;
        console.log(`Translate time for task ${count} is: ${endTime[0]}s ${(endTime[1] / 1e6).toFixed(0)}ms`);
    }
});

consumer.on('error', (err) => console.error('Translate Consumer error:', err));
