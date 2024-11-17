module.exports = {
    apps: [
        {
            name: "app",
            script: "./app.js",
            instances: 1, // 1 instance của app.js
        },
        {
            name: "OcrFilter",
            script: "./server/PipesAndFilters/ConcreteFilter/OcrFilter.js",
            instances: 3, // Chạy 3 instance song song
        },
        {
            name: "TranslateFilter",
            script: "./server/PipesAndFilters/ConcreteFilter/TranslateFilter.js",
            instances: 3,////]\y 3 instance song song
        },
        {
            name: "PdfFilter",
            script: "./server/PipesAndFilters/ConcreteFilter/PdfFilter.js",
            instances: 3, // Chạy 3 instance song song
        },
    ],
};
