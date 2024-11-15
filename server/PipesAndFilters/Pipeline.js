const SourceFilter = require('./ConcreteFilter/SourceFilter');
const OcrFilter = require('./ConcreteFilter/OcrFilter');
const TranslateFilter = require('./ConcreteFilter/TranslateFilter');
const PdfFilter = require('./ConcreteFilter/PdfFilter');
const {unlink} = require("node:fs");
const path = require('path');

class Pipeline {
    constructor() {
        if (Pipeline.instance) {
            return Pipeline.instance;
        }
        Pipeline.instance = this;
        this.sourceFilter = new SourceFilter();
        this.ocrFilter = new OcrFilter();
        this.translateFilter = new TranslateFilter();
        this.pdfFilter = new PdfFilter();
        this.filterList = [this.sourceFilter, this.ocrFilter, this.translateFilter, this.pdfFilter];
        Promise.all(this.filterList.map(filter => filter.connectPipes()));
    }
    async process(data) {
        this.sourceFilter.setData(data);
        try {
            const tasks = this.filterList.map(filter => filter.run());
            Promise.all(tasks);
        } catch (error) {
            console.error("Error occured in the Pipeline: ", error);
        }
    }
}

module.exports = Pipeline;