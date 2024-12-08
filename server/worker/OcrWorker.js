const processOcr = require('../utils/ocr');

// parentPort.on('message', async (message) => {
//     try {
//         const result = await processOcr(message);
//         parentPort.postMessage(result);
//     } catch (error) {
//         parentPort.postMessage({ error: error.message });
//     }
// });

module.exports = async (message) => {
    return await processOcr(message);
}