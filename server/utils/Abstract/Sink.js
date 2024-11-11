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
    }
    
    receive(message) {
        try {
            const ret = JSON.parse(message.content.toString());
            return ret;
        } catch (error) {
            console.error("Error occured when reading message from " + this.inPipe + ": ", error);
        }
        
    }

    async process(data) {

    }
    
    async run() {
        //await this.connectPipes();
        this.channel.consume(this.inPipe, async (message) => {
            const inputData = this.receive(message);
            try {
                await this.process(inputData);
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