const Filter = require('./Filter')
const {unlink} = require("node:fs");

class IntermediateFilter extends Filter {
    /**
     * 
     * @param {string} inPipe 
     * @param {string} outPipe 
     */
    constructor(inPipe, outPipe) {
        super();
        this.pipes = [inPipe, outPipe];
        this.inPipe = inPipe;
        this.outPipe = outPipe;
    }

    receive(message) {
        try {
            const ret = JSON.parse(message.content.toString());
            return ret;
        } catch (error) {
            console.error("Error occured when reading message from " + this.inPipe + ": " , error);
        }
        
    }

    forward(data) {
        this.channel.sendToQueue(this.outPipe, data, {persistent: true});
    }

    async run() {
        return new Promise((resolve, reject) => {
            this.channel.consume(this.inPipe, async (message) => {
                const inputData = this.receive(message);
                console.log("Received message from " + this.inPipe);
    
                try {
                    const outputData = await this.process(inputData);
                    console.log("Sending to " + this.outPipe);
                    this.forward(outputData);
    
                    // Xác nhận xử lý thành công message đầu tiên và tiếp tục
                    resolve();
                } catch (error) {
                    console.error('Lỗi khi gửi tin nhắn tới hàng đợi ' + this.outPipe, error);
                    reject(error); // Reject nếu gặp lỗi
                }
    
                if (this.channel && this.channel.connection && this.channel.connection.stream.readable) {
                    this.channel.ack(message);
                } else {
                    console.error('Channel is not open or already closed');
                }
            }, { noAck: false });
        });
    }
    
}

module.exports = IntermediateFilter;