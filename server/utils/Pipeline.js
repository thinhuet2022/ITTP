const SourceFilter = require('./SourceFilter');
const OcrFilter = require('./OcrFilter');
const TranslateFilter = require('./TranslateFilter');
const PdfFilter = require('./PdfFilter');

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
            await Promise.all(tasks);

        } catch (error) {
            console.error("Error occured in the Pipeline: ", error);
        }
    }
}

module.exports = Pipeline;