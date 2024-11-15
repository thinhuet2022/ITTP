const IntermediateFilter = require('../Abstract/IntermediateFilter');
const translate = require('@iamtraction/google-translate');

class TranslateFilter extends IntermediateFilter {
    constructor() {
        super("translate", "pdf");
    }
    /**
     * 
     * @param {object} data - {fileName, englishText}
     */
    async process(data) {
        const translatedText = await translate(data.englishText, {to: 'vi'});
        const output = {    fileName: data.fileName,
                            translatedText: translatedText.text};
        return Buffer.from(JSON.stringify(output));
    }
}

module.exports = TranslateFilter;