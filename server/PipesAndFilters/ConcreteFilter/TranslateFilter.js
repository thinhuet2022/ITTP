const IntermediateFilter = require('../Abstract/IntermediateFilter');
const translate = require('open-google-translator'); // Giả sử đây là thư viện bạn dùng

class TranslateFilter extends IntermediateFilter {
    constructor() {
        super("translate", "pdf", 3); // "pdf" là queue tiếp theo
    }

    /**
     * Xử lý một batch dữ liệu
     * @param {object} data - { batchIndex, results: [{ fileName, englishText }] }
     * @returns {Buffer} - Kết quả dịch của batch
     */
    async process(data) {
        try {
            const startTime = process.hrtime();
            // Sử dụng Promise.all để dịch song song tất cả văn bản
            const translatedResults = await Promise.all(
                data.results.map(async (item) => {
                    const translatedText = await translate.TranslateLanguageData({
                        listOfWordsToTranslate: [item.englishText], // Văn bản cần dịch
                        fromLanguage: "en", // Dịch từ tiếng Anh
                        toLanguage: "vi", // Sang tiếng Việt
                    });

                    return {
                        fileName: item.fileName,
                        translatedText: translatedText[0].translation, // Dịch văn bản đầu tiên
                    };
                })
            );

            // Đóng gói kết quả của batch
            const output = {
                batchIndex: data.batchIndex,
                translatedResults, // Danh sách kết quả đã dịch
            };

            console.log(`Batch ${data.batchIndex} translated successfully.`);
            const endTime = process.hrtime(startTime);
            console.log(`Batch ${data.batchIndex} processed in ${endTime[0]}s ${endTime[1] / 1000000}ms`);
            return Buffer.from(JSON.stringify(output));
        } catch (error) {
            console.error('Error during translation processing:', error);
            throw error; // Báo lỗi nếu có vấn đề
        }
    }
}

// Chạy Translate Filter
async function run() {
    const translateFilter = new TranslateFilter();
    await translateFilter.connectPipes(); // Kết nối với các queue
    await translateFilter.run(); // Bắt đầu xử lý
}
run().then(() => console.log('TranslateFilter is running.'));
