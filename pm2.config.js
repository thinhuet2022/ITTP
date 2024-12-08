module.exports = {
    apps: [
        {
            name: "app",
            script: "./app.js",
            instances: 1, // Chạy 3 instance song song
        },
        {
            name: "OcrConsumer",
            script: "./server/KafkaPipeline/OcrConsumer.js",
            instances: 3, // Chạy 3 instance song song
        },
        {
            name: "TranslateConsumer",
            script: "./server/KafkaPipeline/TranslateConsumer.js",
            instances: 1,////]\y 3 instance song song
        },
        {
            name: "PdfConsumer",
            script: "./server/KafkaPipeline/PdfConsumer.js",
            instances: 1, // Chạy 3 instance song song
        },
    ],
};
