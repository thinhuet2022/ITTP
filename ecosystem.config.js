module.exports = {
    apps: [
        {
            name: "app",
            script: "./app.js",
            instances: 1,
        },
        {
            name: "ocr",
            script: "./server/RabbitMQPipeline/ConcreteFilter/OcrFilter.js",
            instances: 3,
            exec_mode: "cluster",
            env: {
                NODE_ENV: "development",
            }
        },
        {
            name: "translate",
            script: "./server/RabbitMQPipeline/ConcreteFilter/TranslateFilter.js",
            instances: 1,
            exec_mode: "cluster",
            env: {
                NODE_ENV: "development",
            }
        },
        {
            name: "pdf",
            script: "./server/RabbitMQPipeline/ConcreteFilter/PdfFilter.js",
            instances: 1,
            exec_mode: "cluster",
            env: {
                NODE_ENV: "development",
            }
        }
    ]
};
