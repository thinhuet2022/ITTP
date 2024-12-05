const IntermediateFilter = require('../Abstract/IntermediateFilter');
const translate = require('open-google-translator');

translate.supportedLanguages();
class TranslateFilter extends IntermediateFilter {
    constructor() {
        super("translate", "pdf",3);
    }
    /**
     * 
     * @param {object} data - {fileName, englishText}
     */
    async process(data) {
        // const translatedText = await translate(data.englishText, {to: 'vi'});
        const translatedText = await translate.TranslateLanguageData({
            listOfWordsToTranslate: [data.englishText],
            fromLanguage: "en",
            toLanguage: "vi",
        })
        const output = {    fileName: data.fileName,
                            translatedText: translatedText[0].translation};
        return Buffer.from(JSON.stringify(output));
    }
}
async function run() {
    const translateFilter = new TranslateFilter();
    await translateFilter.connectPipes();
    await translateFilter.run();
}
run().then(r => console.log('TranslateFilter is running'));
