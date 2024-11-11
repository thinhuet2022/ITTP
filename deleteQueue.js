const amqp = require('amqplib');

async function purgeQueue(queue) {
    try {
        const connection = await amqp.connect('amqp://127.0.0.1');
        const channel = await connection.createChannel();

        await channel.purgeQueue(queue);

        console.log(`All messages in queue "${queue}" have been purged`);

        await channel.close();
        await connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

purgeQueue("ocr");
purgeQueue("translate");
purgeQueue("pdf");
