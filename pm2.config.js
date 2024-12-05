module.exports = {
    apps: [
        {
            name: "OcrFilter",
            script: "./server/PipesAndFilters/ConcreteFilter/OcrFilter.js",
            instances: 5, // Chạy 3 instance song song
        },
        {
            name: "TranslateFilter",
            script: "./server/PipesAndFilters/ConcreteFilter/TranslateFilter.js",
            instances: 5,////]\y 3 instance song song
        },
        {
            name: "PdfFilter",
            script: "./server/PipesAndFilters/ConcreteFilter/PdfFilter.js",
            instances: 5, // Chạy 3 instance song song
        },
    ],
};
