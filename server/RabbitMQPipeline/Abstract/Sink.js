const Filter = require('./Filter')

class Sink extends Filter {
    /**
     *
     * @param {string} inPipe - tên input pipe
     */
    constructor(inPipe) {
        super();
        this.pipes = [inPipe];
        this.inPipe = inPipe;
        this.numberOfTask = 0;
    }

    receive(message) {
        try {
            return JSON.parse(message.content.toString());
        } catch (error) {
            console.error("Error occured when reading message from " + this.inPipe + ": ", error);
        }

    }

    async process(data) {

    }

    run() {
        this.channel.consume(this.inPipe, async (message) => {
            const inputData = this.receive(message);
            console.log("Received message from " + this.inPipe);
            try {
                const outputData = await this.process(inputData);
                this.numberOfTask++;
                console.log('Number of task completed: ', this.numberOfTask);
            } catch (error) {
                console.error('Error occurred at Sink', error.message);
            }

            if (this.channel && this.channel.connection && this.channel.connection.stream.readable) {
                this.channel.ack(message);
            } else {
                console.error('Channel is not open or already closed');
            }
        }, {noAck: false});
    }
}

module.exports = Sink;