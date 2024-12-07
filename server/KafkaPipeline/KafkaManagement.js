const kafka = require('kafka-node');
const crypto = require("crypto");

class KafkaManager {
    constructor({kafkaHost}) {
        this.kafkaHost = kafkaHost;
        this.client = new kafka.KafkaClient({kafkaHost});
        this.producer = new kafka.Producer(this.client);
        this.consumers = [];
    }

    // Khởi động Producer
    startProducer(name) {
        this.producer.on('ready', () => {
            console.log(`Kafka Producer for ${name} is ready.`);
        });
        this.producer.on('error', (err) => {
            console.error(`Kafka ${name} error:`, err);
        });
    }

    // Gửi tin nhắn
    sendMessage(topic, messages, numberPartition) {
        const payloads = [
            {
                topic: topic, messages: JSON.stringify(messages),
                partition: this.partitioner(numberPartition, messages.key)
            },
        ];

        this.producer.send(payloads, (err, data) => {
            if (err) {
                console.error('Error sending message:', err);
            }
        });
    }

    // Khởi động Consumer
    addConsumer(topic, groupId, options = {}) {
        const consumer = new kafka.ConsumerGroup(
            {
                kafkaHost: this.kafkaHost,
                groupId,
                fromOffset: 'latest',
                ...options,
            },
            [topic]
        );
        this.consumers.push(consumer);
        return consumer;
    }

    // Đóng Kafka Manager
    async shutdown() {
        await Promise.all([
            new Promise((resolve) => this.producer.close(resolve)),
            ...this.consumers.map(
                (consumer) =>
                    new Promise((resolve) => {
                        consumer.close(true, resolve);
                    })
            ),
        ]);
        console.log('Kafka Manager has shut down.');
    }

    partitioner = (partitions, key) => {
        const partitionCount = partitions.length;
        const hash = crypto.createHash('md5').update(key).digest('hex');
        return parseInt(hash, 16) % partitionCount;
    };
}

module.exports = KafkaManager;
