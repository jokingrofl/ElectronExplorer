
//actions are to be one parameter functions delivering promises
module.exports = class Queue{

    constructor(){
        console.log("Default queue created");
        this._queue = [];
        this.params = [];
        this.isRunning = false;
        this.cancelled = false;
    }

    //start actions in queue
    start(){
        this.isRunning = true;
        this.cancelled = false;
        this.next();
    }

    //pop and start next action
    async next(){
        if (this.cancelled){
            this.isRunning = false;
            return;
        }

        console.log("Queue running following:");
        console.log(this._queue[0]);
        console.log(this.params[0]);
        let done = await this._queue[0](this.params[0]);
        this._queue.shift();
        this.params.shift();
        console.log("Action completed");
        this._queue.length > 0 ? this.next() : this.isRunning = false;
    }

    //add new action to queue, action = function, param = parameter for function
    push(action, param){
        this._queue.push(action);
        this.params.push(param);
    }

    cancel(){
        this.cancelled = true;
        console.log("Cancelled actions");
    }

};