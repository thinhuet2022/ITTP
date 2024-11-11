const Filter = require('./Filter')

class Source extends Filter {
    /**
     * 
     * @param {string} outPipe + tên output pipe 
     */
    constructor(outPipe) {
        super();
        this.pipes = [outPipe];
        this.outPipe = outPipe;
    }

    setData(data) {
        this.data = data;
    }
    
    async process(data) {
        
    }

    async run() {
        //await this.connectPipes();
        this.data = await this.process(this.data);
        try {
            console.log("Sending to " + this.outPipe);
            this.channel.sendToQueue(this.outPipe, this.data, {persistent: true});
        } catch (error) {
            console.error("Error occured when sending data from Source:", error);
        }
    }
}

module.exports = Source;