const amqp = require('amqplib');
const { Console } = require('node:console');


class Filter {

    constructor() {
        this.pipes = [];
    }
    
    async connectRabbitMQ() {
        try {
            const connection = await amqp.connect('amqp://127.0.0.1');
            const channel = await connection.createChannel();
            return [connection, channel];
        } catch(error) {
            console.log(error.message);
        }
    }

    async connectPipes() {
        [this.connection, this.channel]  = await this.connectRabbitMQ();
        try {
            for (const pipe of this.pipes) {
                await this.channel.assertQueue(pipe, {durable: true});
            }
        } catch (error) {
            console.error("Error occured when connecting with pipes", error.message);
        }
    }
    // abstract method that required to be overrided
    async process(data) {

    }
}

module.exports = Filter;