const Translate = require("open-google-translator");
const {PARTITION_1} = require("../constant/constant");

async function processTranslate(message) {
    try {
        const data = JSON.parse(message.value);
        const translatedText = await Translate.TranslateLanguageData({
            listOfWordsToTranslate: [data.text],
            fromLanguage: "en",
            toLanguage: "vi",
        });
        return {
            fileName: data.fileName,
            text: translatedText[0].translation,
            key: data.fileName,
        };
    } catch (error) {
        console.error('Error processing translation:', error);
    }
}
module.exports = { processTranslate };