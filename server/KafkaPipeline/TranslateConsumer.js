const kafka = require('kafka-node');
const Translate  = require('open-google-translator');

// Kafka Consumer setup
const kafkaClient = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });
const consumer = new kafka.Consumer(kafkaClient, [{ topic: 'translate', partition: 0 }], { autoCommit: true });
const producer = new kafka.Producer(kafkaClient);

producer.on('ready', () => console.log('Kafka Producer for Translate is ready.'));
producer.on('error', (err) => console.error('Kafka Producer error:', err));

consumer.on('message', async (message) => {
  //  console.log('Translate Consumer received message:', message);

    try {
        const data = JSON.parse(message.value);
        // const [translatedText] = await translate.translate(data.text, 'vi');
        const translatedText = await Translate.TranslateLanguageData({
            listOfWordsToTranslate: [data.text], // Văn bản cần dịch
            fromLanguage: "en", // Dịch từ tiếng Anh
            toLanguage: "vi", // Sang tiếng Việt
        });
        const translateMessage = {
            fileName: data.fileName,
            text: translatedText[0].translation,
        };

        // Gửi kết quả dịch tới topic `pdf`
        producer.send(
            [{ topic: 'pdf', messages: JSON.stringify(translateMessage) }],
            (err, data) => {
                if (err) console.error('Error sending translated text:', err);
                else console.log(`Sent translated text for ${translateMessage.fileName} to topic pdf.`);
            }
        );
    } catch (error) {
        console.error('Error processing translation:', error);
    }
});

consumer.on('error', (err) => console.error('Translate Consumer error:', err));
