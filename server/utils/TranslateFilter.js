const IntermediateFilter = require('./Abstract/IntermediateFilter');
const translate = require('@iamtraction/google-translate');

class TranslateFilter extends IntermediateFilter {
    constructor() {
        super("translate", "pdf");
    }
    /**
     * 
     * @param {string} data - English text
     */
    async process(data) {
        const translatedText = await translate(data, {to: 'vi'});
        return Buffer.from(JSON.stringify(translatedText));
    }
}

module.exports = TranslateFilter;