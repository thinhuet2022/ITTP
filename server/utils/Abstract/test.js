const { list } = require("pdfkit");

class Parent { 
    constructor() {

    }
    say() {
        console.log("Dad");
    }
}

class Sun extends Parent { 
    constructor() {
        super();
    }
    say() {
        super.say();
        console.log("Sun");
    }
}

sun = new Sun();
sun.say();