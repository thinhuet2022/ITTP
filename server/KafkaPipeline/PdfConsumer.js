const {CONSUMER_OPTIONS, PDF_TOPIC} = require("../constant/constant");
const KafkaManager = require("./KafkaManagement");
const {processPdf} = require("../utils/pdf");

const kafkaInstance = new KafkaManager({kafkaHost: 'localhost:9092'});

kafkaInstance.addConsumer('pdf', 'pdf-consumer-group', CONSUMER_OPTIONS);

let count = 0;
const consumer = kafkaInstance.consumers.pop();
consumer.on('message', async (message) => {
    console.log('PDF Consumer processing task');
    const startTime = process.hrtime();
    try{
        await processPdf(message);
    }
    catch (error){
        console.error('Error processing PDF:', error);
    }
    finally {
        const endTime = process.hrtime(startTime);
        count++;
        console.log(`PDF time for task ${count} is: ${endTime[0]}s ${(endTime[1] / 1e6).toFixed(1)}ms`);
    }
});

consumer.on('error', (err) => console.error('PDF Consumer error:', err));

console.log('PDF Consumer is running...');