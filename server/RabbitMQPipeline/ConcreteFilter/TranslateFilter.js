const IntermediateFilter = require('../Abstract/IntermediateFilter');
const translate = require('open-google-translator');

class TranslateFilter extends IntermediateFilter {
    constructor() {
        super("translate", "pdf");
    }

    async process(data) {
        const startTime = process.hrtime();
        try {
            const translatedText = await translate.TranslateLanguageData({
                listOfWordsToTranslate: [data.englishText.text],
                fromLanguage: "en",
                toLanguage: "vi",
            })
            const output = {
                fileName: data.fileName,
                translatedText: translatedText[0].translation};
            return Buffer.from(JSON.stringify(output));
        } catch (error) {
            console.error('Error during translation processing:', error);
            throw error;
        } finally {
            const elapsedTime = process.hrtime(startTime);
            console.log(`TranslateFilter: Processed ${data.fileName} in ${elapsedTime[0]}s ${(elapsedTime[1] / 1e6).toFixed(0)}ms`);
        }
    }
}

async function run() {
    const translateFilter = new TranslateFilter();
    await translateFilter.connectPipes();
    await translateFilter.run();
}
run().then(() => console.log('TranslateFilter is running.'));
