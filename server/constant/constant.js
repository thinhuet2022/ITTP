const PARTITION_2 = [0,1];
const PARTITION_1 = [0];
const PARTITION_3 = [0, 1, 2, 3, 4];
const CONSUMER_OPTIONS = {
    sessionTimeout: 30000,
    protocol: ['roundrobin'],
    autoCommit: true,
};
const OCR_TOPIC = 'ocr';
const TRANSLATE_TOPIC = 'translate';
const PDF_TOPIC = 'pdf';
const NUMBER_OF_OCR_CONSUMER = 3;
module.exports = {NUMBER_OF_OCR_CONSUMER, CONSUMER_OPTIONS, PARTITION_1, PARTITION_2, PARTITION_3, OCR_TOPIC, PDF_TOPIC, TRANSLATE_TOPIC};