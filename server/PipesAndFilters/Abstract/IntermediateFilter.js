const Filter = require('./Filter')
const {unlink} = require("node:fs");

class IntermediateFilter extends Filter {
    /**
     *
     * @param {string} inPipe
     * @param {string} outPipe
     * @param prefetchNumber
     */
    constructor(inPipe, outPipe, prefetchNumber = 1) {
        super();
        this.pipes = [inPipe, outPipe];
        this.inPipe = inPipe;
        this.outPipe = outPipe;
        this.numberOfTask = 0;
        this.prefetchNumber = prefetchNumber;
    }

    receive(message) {
        try {
            return JSON.parse(message.content.toString());
        } catch (error) {
            console.error("Error occured when reading message from " + this.inPipe + ": ", error);
        }

    }

    forward(data) {
        this.channel.sendToQueue(this.outPipe, data);
    }

    run() {
        this.channel.consume(this.inPipe, async (message) => {
            const inputData = this.receive(message);
            console.log("Received message from " + this.inPipe);

            try {
                const outputData = await this.process(inputData);
                this.numberOfTask++;
                console.log('Number of task completed: ', this.numberOfTask);
                console.log("Sending to " + this.outPipe);
                this.forward(outputData);
            } catch (error) {
                console.error('Lỗi khi gửi tin nhắn tới hàng đợi ' + this.outPipe, error);
            }
            if (this.channel && this.channel.connection && this.channel.connection.stream.readable) {
                this.channel.ack(message);
            } else {
                console.error('Channel is not open or already closed');
            }
        }, {noAck: false});
    }

}

module.exports = IntermediateFilter;