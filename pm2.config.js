module.exports = {
    apps: [
        {
            name: "OcrConsumer",
            script: "./server/KafkaPipeline/OcrConsumer.js",
            instances: 3, // Chạy 3 instance song song
        },
        {
            name: "TranslateConsumer",
            script: "./server/KafkaPipeline/TranslateConsumer.js",
            instances: 2,////]\y 3 instance song song
        },
        {
            name: "PdfConsumer",
            script: "./server/KafkaPipeline/PdfConsumer.js",
            instances: 2, // Chạy 3 instance song song
        },
    ],
};
